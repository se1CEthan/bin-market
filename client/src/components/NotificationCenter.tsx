import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  DollarSign,
  Download,
  MessageSquare,
  Star,
  Trash2,
  Settings,
  Filter,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'sale' | 'review' | 'message' | 'system' | 'payout';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export function NotificationCenter() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'sales' | 'reviews'>('all');
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark all as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const filteredNotifications = notifications?.filter((notification) => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'sales') return notification.type === 'sale';
    if (filter === 'reviews') return notification.type === 'review';
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'payout':
        return <Download className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Notifications
            {unreadCount && unreadCount.count > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount.count}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('sales')}>
                  Sales
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('reviews')}>
                  Reviews
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={!unreadCount?.count}
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : filteredNotifications && filteredNotifications.length > 0 ? (
            <div className="space-y-1">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {notification.data?.amount && (
                          <Badge variant="outline" className="text-xs">
                            ${notification.data.amount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-sm">We'll notify you about sales, reviews, and updates</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function NotificationBell() {
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return (
    <div className="relative">
      <Button variant="ghost" size="sm">
        <Bell className="h-5 w-5" />
        {unreadCount && unreadCount.count > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount.count > 99 ? '99+' : unreadCount.count}
          </Badge>
        )}
      </Button>
    </div>
  );
}

// Real-time notification hook
export function useRealTimeNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // In a real implementation, you'd connect to WebSocket here
    // For now, we'll use polling
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);
}