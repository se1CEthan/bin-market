import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  Trophy,
  Star,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Crown,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SocialFeaturesProps {
  botId: string;
  developerId: string;
}

interface Comment {
  id: string;
  userId: string;
  user: {
    name: string;
    avatarUrl?: string;
    isDeveloper: boolean;
    isVerified: boolean;
  };
  content: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike';
  replies: Comment[];
  createdAt: string;
  isEdited: boolean;
}

interface Developer {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  followers: number;
  following: number;
  totalBots: number;
  totalSales: number;
  averageRating: number;
  badges: string[];
  isFollowing: boolean;
  isVerified: boolean;
  joinedAt: string;
}

export function SocialFeatures({ botId, developerId }: SocialFeaturesProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const { data: socialStats } = useQuery({
    queryKey: [`/api/bots/${botId}/social-stats`],
  });

  const { data: comments } = useQuery<Comment[]>({
    queryKey: [`/api/bots/${botId}/comments`],
  });

  const { data: developer } = useQuery<Developer>({
    queryKey: [`/api/developers/${developerId}/profile`],
  });

  const likeBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/bots/${botId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to like bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bots/${botId}/social-stats`] });
      toast({ title: 'Bot liked!' });
    },
  });

  const bookmarkBotMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/bots/${botId}/bookmark`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to bookmark bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bots/${botId}/social-stats`] });
      toast({ title: 'Bot bookmarked!' });
    },
  });

  const followDeveloperMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/developers/${developerId}/follow`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to follow developer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/developers/${developerId}/profile`] });
      toast({ title: 'Now following developer!' });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: { content: string; parentId?: string }) => {
      const response = await fetch(`/api/bots/${botId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bots/${botId}/comments`] });
      setNewComment('');
      setReplyTo(null);
      toast({ title: 'Comment added!' });
    },
  });

  const voteCommentMutation = useMutation({
    mutationFn: async (data: { commentId: string; vote: 'like' | 'dislike' }) => {
      const response = await fetch(`/api/comments/${data.commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: data.vote }),
      });
      if (!response.ok) throw new Error('Failed to vote');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bots/${botId}/comments`] });
    },
  });

  const shareBot = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this bot!',
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied to clipboard!' });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'verified':
        return <Crown className="h-3 w-3" />;
      case 'top-seller':
        return <Trophy className="h-3 w-3" />;
      case 'rising-star':
        return <TrendingUp className="h-3 w-3" />;
      case 'power-user':
        return <Zap className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'verified':
        return 'bg-blue-500';
      case 'top-seller':
        return 'bg-yellow-500';
      case 'rising-star':
        return 'bg-green-500';
      case 'power-user':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => likeBotMutation.mutate()}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${socialStats?.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {socialStats?.likes || 0}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bookmarkBotMutation.mutate()}
                className="flex items-center gap-2"
              >
                <Bookmark className={`h-4 w-4 ${socialStats?.isBookmarked ? 'fill-blue-500 text-blue-500' : ''}`} />
                {socialStats?.bookmarks || 0}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareBot}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                <MessageCircle className="h-3 w-3 mr-1" />
                {comments?.length || 0} comments
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Profile */}
      {developer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Developer Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={developer.avatarUrl} />
                <AvatarFallback>{developer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{developer.name}</h3>
                  {developer.isVerified && (
                    <Badge className="bg-blue-500">
                      <Crown className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {developer.bio || 'No bio available'}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>{developer.followers} followers</span>
                  <span>{developer.following} following</span>
                  <span>{developer.totalBots} bots</span>
                  <span>{developer.totalSales} sales</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {developer.badges.map((badge) => (
                    <Badge key={badge} className={getBadgeColor(badge)}>
                      {getBadgeIcon(badge)}
                      <span className="ml-1 capitalize">{badge.replace('-', ' ')}</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => followDeveloperMutation.mutate()}
                    className="flex items-center gap-2"
                  >
                    {developer.isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({comments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          {user && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {replyTo && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyTo(null)}
                        >
                          Cancel Reply
                        </Button>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addCommentMutation.mutate({
                        content: newComment,
                        parentId: replyTo || undefined,
                      })}
                      disabled={!newComment.trim()}
                    >
                      {replyTo ? 'Reply' : 'Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments?.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={setReplyTo}
                onVote={(commentId, vote) => voteCommentMutation.mutate({ commentId, vote })}
              />
            ))}
            {(!comments || comments.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  onVote,
  level = 0,
}: {
  comment: Comment;
  onReply: (commentId: string) => void;
  onVote: (commentId: string, vote: 'like' | 'dislike') => void;
  level?: number;
}) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-muted pl-4' : ''}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatarUrl} />
          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user.name}</span>
            {comment.user.isDeveloper && (
              <Badge variant="outline" className="text-xs">
                Developer
              </Badge>
            )}
            {comment.user.isVerified && (
              <Crown className="h-3 w-3 text-blue-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-muted-foreground">(edited)</span>
            )}
          </div>
          <p className="text-sm mb-2">{comment.content}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(comment.id, 'like')}
                className={`h-6 px-2 ${comment.userVote === 'like' ? 'text-green-600' : ''}`}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                {comment.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onVote(comment.id, 'dislike')}
                className={`h-6 px-2 ${comment.userVote === 'dislike' ? 'text-red-600' : ''}`}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                {comment.dislikes}
              </Button>
            </div>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(comment.id)}
                className="h-6 px-2"
              >
                Reply
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {comment.replies.length > 0 && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
              </Button>
              {showReplies && (
                <div className="mt-2 space-y-3">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onReply={onReply}
                      onVote={onVote}
                      level={level + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}