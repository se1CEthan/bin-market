import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Download, Eye, ShoppingCart, Heart, Bookmark, Zap, TrendingUp, Crown, Sparkles, Tag } from 'lucide-react';
import { cardHover, morphingCard, glowEffect, staggerItem } from '@/lib/animations';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Bot } from '@shared/schema';

interface BotCardProps {
  bot: Bot & {
    developer?: {
      name: string;
      avatarUrl: string | null;
    };
    category?: {
      name: string;
    };
  };
}

export function BotCard({ bot }: BotCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const getBotBadges = () => {
    const badges = [];
    
    if (bot.isFeatured) {
      badges.push({ icon: Crown, label: 'Featured', color: 'bg-yellow-500' });
    }
    
    if (parseFloat(bot.averageRating || '0') >= 4.5) {
      badges.push({ icon: Star, label: 'Top Rated', color: 'bg-green-500' });
    }
    
    if (bot.downloadCount > 1000) {
      badges.push({ icon: TrendingUp, label: 'Popular', color: 'bg-blue-500' });
    }
    
    return badges;
  };

  const badges = getBotBadges();
  
  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      data-testid={`card-bot-${bot.id}`}
      className="cursor-pointer"
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
    >
      <Link href={`/bot/${bot.id}`}>
        <motion.div
          variants={cardHover}
          className="relative"
        >
          <Card className="overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            />
            
            {/* Thumbnail with Advanced Effects */}
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
              {bot.thumbnailUrl ? (
                <motion.img
                  src={bot.thumbnailUrl}
                  alt={bot.title}
                  className="object-cover w-full h-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              ) : (
                <motion.div 
                  className="w-full h-full flex items-center justify-center text-muted-foreground bg-gradient-to-br from-primary/10 to-secondary/10"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.span 
                    className="text-6xl"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🤖
                  </motion.span>
                </motion.div>
              )}
              
              {/* Floating Action Buttons */}
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute top-2 left-2 flex gap-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLike}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        isLiked 
                          ? 'bg-red-500/90 text-white' 
                          : 'bg-white/90 text-gray-700 hover:bg-red-50'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleBookmark}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        isBookmarked 
                          ? 'bg-blue-500/90 text-white' 
                          : 'bg-white/90 text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                <AnimatePresence>
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge className={`${badge.color} text-white backdrop-blur-sm flex items-center gap-1`}>
                        <badge.icon className="h-3 w-3" />
                        {badge.label}
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />
            </div>

            <CardContent className="p-6 relative">
              {/* Title and Price */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <motion.h3 
                  className="font-display font-bold text-xl line-clamp-2 flex-1" 
                  data-testid={`text-bot-title-${bot.id}`}
                  whileHover={{ scale: 1.02 }}
                >
                  {bot.title}
                </motion.h3>
                <motion.div
                  className="flex flex-col items-end"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="font-mono font-bold text-2xl text-primary" data-testid={`text-bot-price-${bot.id}`}>
                    ${bot.price}
                  </span>
                  <span className="text-xs text-muted-foreground">one-time</span>
                </motion.div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {bot.description}
              </p>

              {/* Developer Info */}
              {bot.developer && (
                <motion.div 
                  className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-muted/30"
                  whileHover={{ backgroundColor: 'rgba(var(--muted), 0.5)' }}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarImage src={bot.developer.avatarUrl || undefined} />
                    <AvatarFallback className="text-sm bg-primary text-primary-foreground font-semibold">
                      {bot.developer.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{bot.developer.name}</p>
                    <p className="text-xs text-muted-foreground">Developer</p>
                  </div>
                </motion.div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold" data-testid={`text-bot-rating-${bot.id}`}>
                      {bot.averageRating || '0.00'}
                    </span>
                    <span className="text-muted-foreground">({bot.reviewCount})</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Download className="h-4 w-4 text-green-500" />
                    <span className="font-semibold" data-testid={`text-bot-downloads-${bot.id}`}>
                      {bot.downloadCount.toLocaleString()}
                    </span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">
                      {bot.viewCount?.toLocaleString() || '0'}
                    </span>
                  </motion.div>
                </div>

                {/* Quick Action Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!user) {
                        toast({ title: 'Login Required', description: 'Please sign in to purchase bots.', variant: 'destructive' });
                        return;
                      }
                      if (user.id === bot.developer?.id) {
                        toast({ title: 'Invalid Action', description: 'You cannot purchase your own bot.', variant: 'destructive' });
                        return;
                      }

                      try {
                        const response = await apiRequest('POST', `/api/bots/${bot.id}/purchase`, {});
                        const data = await response.json();
                        if (data.approvalUrl) {
                          window.location.href = data.approvalUrl;
                        } else {
                          toast({ title: 'Purchase Successful', description: 'Your purchase completed.' });
                          queryClient.invalidateQueries({ queryKey: ['/api/account/purchases'] });
                        }
                      } catch (err) {
                        toast({ title: 'Purchase Failed', description: 'Unable to initiate purchase. Please try again.', variant: 'destructive' });
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </motion.div>
              </div>
            </CardContent>

            {/* Category Footer */}
            {bot.category && (
              <CardFooter className="p-6 pt-0">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="w-full"
                >
                  <Badge 
                    variant="secondary" 
                    className="text-sm px-3 py-1 bg-gradient-to-r from-secondary to-secondary/80"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {bot.category.name}
                  </Badge>
                </motion.div>
              </CardFooter>
            )}

            {/* Hover Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(var(--primary), 0.1), transparent)',
                filter: 'blur(1px)',
              }}
            />
          </Card>
        </motion.div>
      </Link>
    </motion.div>
  );
}
