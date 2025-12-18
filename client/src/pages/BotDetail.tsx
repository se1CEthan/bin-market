import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Star, 
  Download, 
  Eye, 
  ShoppingCart, 
  MessageSquare, 
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Terminal
} from 'lucide-react';
import type { Bot, Review } from '@shared/schema';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { TestBox } from '@/components/TestBox';

export default function BotDetail() {
  const [, params] = useRoute('/bot/:id');
  const botId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: bot, isLoading } = useQuery<Bot & {
    developer: { id: string; name: string; avatarUrl: string | null; email: string };
    category: { name: string };
    hasPurchased?: boolean;
  }>({
    queryKey: ['/api/bots', botId],
    enabled: !!botId,
  });

  const { data: reviews } = useQuery<(Review & { user: { name: string; avatarUrl: string | null } })[]>({
    queryKey: ['/api/bots', botId, 'reviews'],
    enabled: !!botId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/bots/${botId}/purchase`, {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        toast({
          title: 'Purchase Successful!',
          description: 'You can now download the bot.',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/bots', botId] });
        queryClient.invalidateQueries({ queryKey: ['/api/account/purchases'] });
      }
    },
    onError: () => {
      toast({
        title: 'Purchase Failed',
        description: 'Unable to complete purchase. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to purchase bots.',
        variant: 'destructive',
      });
      return;
    }
    purchaseMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-semibold text-xl mb-2">Bot Not Found</h2>
            <p className="text-muted-foreground mb-4">The bot you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/bots">Browse Bots</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const allImages = bot.thumbnailUrl 
    ? [bot.thumbnailUrl, ...(bot.screenshots || [])]
    : bot.screenshots || [];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Media & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Media */}
            <Card className="overflow-hidden">
              {bot.demoVideoUrl ? (
                <div className="aspect-video bg-black">
                  <video
                    src={bot.demoVideoUrl}
                    controls
                    className="w-full h-full"
                    data-testid="video-demo"
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : allImages.length > 0 ? (
                <div className="aspect-video bg-muted">
                  <img
                    src={allImages[selectedImage]}
                    alt={bot.title}
                    className="w-full h-full object-cover"
                    data-testid="img-bot-main"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <span className="text-6xl">🤖</span>
                </div>
              )}

              {/* Screenshot Thumbnails */}
              {allImages.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === idx ? 'border-primary' : 'border-transparent'
                      }`}
                      data-testid={`button-thumbnail-${idx}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Title & Meta */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="font-display text-3xl md:text-4xl font-bold mb-2" data-testid="text-bot-title">
                    {bot.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold" data-testid="text-rating">{bot.averageRating || '0.00'}</span>
                      <span>({bot.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span data-testid="text-downloads">{bot.downloadCount} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{bot.viewCount} views</span>
                    </div>
                  </div>
                </div>
                {bot.isFeatured && (
                  <Badge className="bg-primary">Featured</Badge>
                )}
              </div>

              {/* Developer Info */}
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={bot.developer.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {bot.developer.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Created by</p>
                    <Link href={`/developer/${bot.developer.id}`}>
                      <a className="font-semibold hover:text-primary transition-colors" data-testid="link-developer">
                        {bot.developer.name}
                      </a>
                    </Link>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!user || user.id === bot.developer.id}
                    data-testid="button-message-developer"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
                <TabsTrigger value="reviews" data-testid="tab-reviews">Reviews ({bot.reviewCount})</TabsTrigger>
                <TabsTrigger value="support" data-testid="tab-support">Support</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Bot</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{bot.description}</p>
                  </CardContent>
                </Card>

                {bot.features && bot.features.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {bot.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {bot.requirements && (
                  <Card>
                    <CardHeader>
                      <CardTitle>System Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap">{bot.requirements}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.user.avatarUrl || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {review.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{review.user.name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="support">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Get Support</h3>
                    <p className="text-muted-foreground mb-4">
                      Need help with this bot? Contact the developer directly for support.
                    </p>
                    <Button variant="outline" disabled={!user}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message Developer
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Purchase Card */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Price</p>
                  <p className="font-mono text-4xl font-bold text-primary" data-testid="text-price">
                    ${bot.price}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary">{bot.category.name}</Badge>
                  </div>
                  {bot.supportedOS && bot.supportedOS.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Supported OS</span>
                      <span className="font-medium">{bot.supportedOS.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={bot.status === 'approved' ? 'default' : 'secondary'}>
                      {bot.status}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {bot.hasPurchased ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Already Purchased</span>
                    </div>
                    <Button className="w-full" asChild data-testid="button-download">
                      <Link href={`/download/${bot.id}`}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Bot
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={!user || user.id === bot.developer.id || purchaseMutation.isPending}
                      data-testid="button-buy-now"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {purchaseMutation.isPending ? 'Processing...' : 'Buy Now'}
                    </Button>
                    <TestBox 
                      botTitle={bot.title}
                      botDescription={bot.description}
                    />
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Instant download after purchase
                  </p>
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    7-day money-back guarantee
                  </p>
                  <p className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Developer support included
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
