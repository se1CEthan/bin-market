/**
 * Live Activity Feed Component
 * Real-time activity feed showing live user interactions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ShoppingCart, 
  Upload, 
  UserPlus, 
  Star, 
  Shield,
  Activity,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useLiveActivity } from '@/lib/live-data';
import { AdvancedSpinner } from '@/components/ui/advanced-loading';

const activityIcons = {
  bot_purchased: ShoppingCart,
  bot_uploaded: Upload,
  user_joined: UserPlus,
  bot_reviewed: Star,
  developer_verified: Shield,
};

const activityColors = {
  bot_purchased: 'text-green-500',
  bot_uploaded: 'text-blue-500',
  user_joined: 'text-purple-500',
  bot_reviewed: 'text-yellow-500',
  developer_verified: 'text-orange-500',
};

export function LiveActivityFeed({ 
  className,
  maxItems = 10,
  showHeader = true 
}: {
  className?: string;
  maxItems?: number;
  showHeader?: boolean;
}) {
  const { activities, loading, error } = useLiveActivity();

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 flex items-center justify-center">
          <AdvancedSpinner variant="dots" size="md" />
          <span className="ml-3 text-muted-foreground">Loading live activity...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-6 text-center text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Unable to load live activity</p>
        </div>
      </Card>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      {showHeader && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Live Activity</h3>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </Badge>
          </div>
        </div>
      )}
      
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {displayActivities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <motion.div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                layout
              >
                <motion.div
                  className={`p-2 rounded-full bg-muted ${colorClass}`}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {activity.message}
                      </p>
                      
                      {activity.bot && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {activity.bot.category}
                          </Badge>
                          {activity.type === 'bot_reviewed' && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">5.0</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  </div>
                  
                  {activity.user && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {displayActivities.length === 0 && (
          <motion.div
            className="text-center py-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </motion.div>
        )}
      </div>
      
      {activities.length > maxItems && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {maxItems} of {activities.length} activities</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>Live updates</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Compact version for smaller spaces
export function CompactActivityFeed({ 
  className,
  maxItems = 5 
}: {
  className?: string;
  maxItems?: number;
}) {
  const { activities, loading } = useLiveActivity();

  if (loading) {
    return (
      <div className={className}>
        <AdvancedSpinner variant="dots" size="sm" />
      </div>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={className}>
      <AnimatePresence mode="popLayout">
        {displayActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-center gap-2 py-2 text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="truncate">{activity.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}