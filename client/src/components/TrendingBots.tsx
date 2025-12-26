/**
 * Trending Bots Component
 * Real-time trending bots with live data
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Star, 
  Download, 
  Eye,
  Zap,
  
  Flame,
  Crown
} from 'lucide-react';
import { ArrowRight } from '@/components/icons/ArrowRight';
import { useTrendingBots } from '@/lib/live-data';
import { AdvancedSpinner } from '@/components/ui/advanced-loading';
import { cn } from '@/lib/utils';

export function TrendingBots({ 
  className,
  maxItems = 6,
  showHeader = true,
  variant = 'grid'
}: {
  className?: string;
  maxItems?: number;
  showHeader?: boolean;
  variant?: 'grid' | 'list' | 'compact';
}) {
  const { bots, loading, error } = useTrendingBots();

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 flex items-center justify-center">
          <AdvancedSpinner variant="orbit" size="md" />
          <span className="ml-3 text-muted-foreground">Loading trending bots...</span>
        </div>
      </Card>
    );
  }

  if (error || !bots.length) {
    return (
      <Card className={className}>
        <div className="p-6 text-center text-muted-foreground">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Unable to load trending bots</p>
        </div>
      </Card>
    );
  }

  const displayBots = bots.slice(0, maxItems);

  if (variant === 'compact') {
    return (
      <div className={className}>
        <AnimatePresence mode="popLayout">
          {displayBots.map((bot, index) => (
            <motion.div
              key={bot.id}
              className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-muted-foreground">
                    #{index + 1}
                  </span>
                  {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                  {index < 3 && <Flame className="w-4 h-4 text-orange-500" />}
                </div>
                <div>
                  <Link href={`/bot/${bot.id}`}>
                    <span className="font-medium hover:text-primary transition-colors cursor-pointer">
                      {bot.name}
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{bot.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      <span>{bot.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${bot.price}</div>
                <div className="text-xs text-muted-foreground">
                  {bot.downloads.toLocaleString()} downloads
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <Card className={className}>
        {showHeader && (
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Trending Bots</h3>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                Hot
              </Badge>
            </div>
          </div>
        )}
        
        <div className="p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {displayBots.map((bot, index) => (
              <motion.div
                key={bot.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 ? "bg-yellow-500 text-white" :
                      index === 1 ? "bg-gray-400 text-white" :
                      index === 2 ? "bg-orange-600 text-white" :
                      "bg-muted text-muted-foreground"
                    )}
                    animate={{ rotate: index < 3 ? [0, 5, -5, 0] : 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {index + 1}
                  </motion.div>
                  {index < 3 && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Flame className="w-4 h-4 text-orange-500" />
                    </motion.div>
                  )}
                </div>
                
                <div className="flex-1">
                  <Link href={`/bot/${bot.id}`}>
                    <h4 className="font-medium group-hover:text-primary transition-colors cursor-pointer">
                      {bot.name}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{bot.category}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current text-yellow-500" />
                      <span>{bot.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{bot.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold text-lg">${bot.price}</div>
                  <Badge variant="outline" className="text-xs">
                    {bot.trending_score.toFixed(1)}% trending
                  </Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Trending Bots</h2>
          </div>
          <Link href="/trending">
            <Button variant="outline" className="flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {displayBots.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow group relative overflow-hidden">
                {/* Trending indicator */}
                {index < 3 && (
                  <motion.div
                    className="absolute top-4 right-4"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Badge 
                      variant={index === 0 ? "default" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {index === 0 && <Crown className="w-3 h-3" />}
                      <Flame className="w-3 h-3" />
                      #{index + 1}
                    </Badge>
                  </motion.div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Link href={`/bot/${bot.id}`}>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors cursor-pointer">
                        {bot.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      by {bot.developer}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{bot.category}</Badge>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-current text-yellow-500" />
                      <span>{bot.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{bot.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{bot.trending_score.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        ${bot.price}
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/bot/${bot.id}`}>
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}