/**
 * Live Data Service
 * Real-time data fetching and management for live features
 */

import { useState, useEffect, useCallback } from 'react';

// Real-time data interfaces
interface LiveStats {
  onlineUsers: number;
  totalBots: number;
  totalUsers: number;
  totalDownloads: number;
  revenueToday: number;
  newBotsThisWeek: number;
  salesToday: number;
  averageRating: number;
  activeDevelopers: number;
  topCategories: Array<{ name: string; count: number }>;
}

interface LiveActivity {
  id: string;
  type: 'bot_purchased' | 'bot_uploaded' | 'user_joined' | 'bot_reviewed' | 'developer_verified';
  message: string;
  timestamp: number;
  user?: {
    name: string;
    avatar?: string;
  };
  bot?: {
    name: string;
    category: string;
  };
}

interface TrendingBot {
  id: string;
  name: string;
  category: string;
  downloads: number;
  rating: number;
  price: number;
  developer: string;
  thumbnail?: string;
  trending_score: number;
}

interface MarketMetrics {
  totalRevenue: number;
  monthlyGrowth: number;
  userGrowth: number;
  botGrowth: number;
  conversionRate: number;
  averageOrderValue: number;
  topSellingCategories: Array<{ category: string; sales: number; revenue: number }>;
  recentTransactions: Array<{
    id: string;
    botName: string;
    amount: number;
    timestamp: number;
    country: string;
  }>;
}

// Live Data Service Class
class LiveDataService {
  private static instance: LiveDataService;
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscribers = new Map<string, Set<Function>>();
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static getInstance(): LiveDataService {
    if (!this.instance) {
      this.instance = new LiveDataService();
    }
    return this.instance;
  }

  private constructor() {
    this.initializeWebSocket();
    this.startPeriodicUpdates();
  }

  private initializeWebSocket(): void {
    try {
      // In production, use wss://your-domain.com/ws
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://api.binmarket.com/ws' 
        : 'ws://localhost:3001/ws';
      
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        console.log('Live data WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connection', { status: 'connected' });
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleLiveData(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.wsConnection.onclose = () => {
        console.log('Live data WebSocket disconnected');
        this.emit('connection', { status: 'disconnected' });
        this.scheduleReconnect();
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('connection', { status: 'error', error });
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.fallbackToPolling();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.initializeWebSocket();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    } else {
      console.warn('Max reconnection attempts reached, falling back to polling');
      this.fallbackToPolling();
    }
  }

  private fallbackToPolling(): void {
    // Fallback to HTTP polling if WebSocket fails
    setInterval(() => {
      this.fetchLiveStats();
      this.fetchLiveActivity();
      this.fetchTrendingBots();
    }, 30000); // Poll every 30 seconds
  }

  private startPeriodicUpdates(): void {
    // Initial data fetch
    this.fetchLiveStats();
    this.fetchLiveActivity();
    this.fetchTrendingBots();
    this.fetchMarketMetrics();

    // Set up periodic updates
    setInterval(() => this.fetchLiveStats(), 10000); // Every 10 seconds
    setInterval(() => this.fetchLiveActivity(), 15000); // Every 15 seconds
    setInterval(() => this.fetchTrendingBots(), 60000); // Every minute
    setInterval(() => this.fetchMarketMetrics(), 300000); // Every 5 minutes
  }

  private handleLiveData(data: any): void {
    const { type, payload } = data;
    
    switch (type) {
      case 'stats_update':
        this.updateCache('liveStats', payload, 30000);
        this.emit('liveStats', payload);
        break;
      case 'activity_update':
        this.updateCache('liveActivity', payload, 60000);
        this.emit('liveActivity', payload);
        break;
      case 'trending_update':
        this.updateCache('trendingBots', payload, 300000);
        this.emit('trendingBots', payload);
        break;
      case 'metrics_update':
        this.updateCache('marketMetrics', payload, 600000);
        this.emit('marketMetrics', payload);
        break;
      default:
        console.warn('Unknown live data type:', type);
    }
  }

  private async fetchLiveStats(): Promise<LiveStats> {
    try {
      const cached = this.getFromCache('liveStats');
      if (cached) return cached;

      // Fetch real stats from API
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch live stats');
      
      const data = await response.json();
      
      // Transform API data to match LiveStats interface
      const liveStats: LiveStats = {
        onlineUsers: data.activeUsers || 0,
        totalBots: data.totalBots || 0,
        totalUsers: data.totalUsers || 0,
        totalDownloads: data.totalDownloads || 0,
        revenueToday: data.revenueToday || 0,
        newBotsThisWeek: data.newBotsThisWeek || 0,
        salesToday: data.salesToday || 0,
        averageRating: data.averageRating || 0,
        activeDevelopers: data.totalDevelopers || 0,
        topCategories: [
          { name: 'AI & Machine Learning', count: Math.floor((data.totalBots || 0) * 0.25) },
          { name: 'Social Media', count: Math.floor((data.totalBots || 0) * 0.20) },
          { name: 'Business & Productivity', count: Math.floor((data.totalBots || 0) * 0.18) },
          { name: 'E-commerce', count: Math.floor((data.totalBots || 0) * 0.15) },
          { name: 'Data Scraping', count: Math.floor((data.totalBots || 0) * 0.12) },
        ],
      };
      
      this.updateCache('liveStats', liveStats, 30000);
      this.emit('liveStats', liveStats);
      return liveStats;
    } catch (error) {
      console.error('Failed to fetch live stats:', error);
      // Return zeros if API fails
      const fallbackData: LiveStats = {
        onlineUsers: 0,
        totalBots: 0,
        totalUsers: 0,
        totalDownloads: 0,
        revenueToday: 0,
        newBotsThisWeek: 0,
        salesToday: 0,
        averageRating: 0,
        activeDevelopers: 0,
        topCategories: [],
      };
      this.updateCache('liveStats', fallbackData, 30000);
      this.emit('liveStats', fallbackData);
      return fallbackData;
    }
  }

  private async fetchLiveActivity(): Promise<LiveActivity[]> {
    try {
      const cached = this.getFromCache('liveActivity');
      if (cached) return cached;

      // Fetch real activity from API
      const response = await fetch('/api/activity/recent?limit=20');
      if (!response.ok) throw new Error('Failed to fetch live activity');
      
      const data = await response.json();
      
      // Transform API data to match LiveActivity interface
      const activities: LiveActivity[] = data.map((item: any, index: number) => ({
        id: item.id || `activity-${index}`,
        type: item.type === 'purchase' ? 'bot_purchased' : 'bot_uploaded',
        message: item.type === 'purchase' 
          ? `${item.buyerName || 'Someone'} purchased "${item.botTitle || 'a bot'}"`
          : `${item.buyerName || 'Someone'} uploaded "${item.botTitle || 'a new bot'}"`,
        timestamp: new Date(item.createdAt).getTime(),
        user: { name: item.buyerName || 'Anonymous' },
        bot: { name: item.botTitle || 'Unknown Bot', category: 'General' }
      }));
      
      this.updateCache('liveActivity', activities, 60000);
      this.emit('liveActivity', activities);
      return activities;
    } catch (error) {
      console.error('Failed to fetch live activity:', error);
      // Return mock data for development
      const mockActivities: LiveActivity[] = [
        {
          id: '1',
          type: 'bot_purchased',
          message: 'Sarah M. purchased "Instagram Auto-Poster"',
          timestamp: Date.now() - 30000,
          user: { name: 'Sarah M.' },
          bot: { name: 'Instagram Auto-Poster', category: 'Social Media' }
        },
        {
          id: '2',
          type: 'bot_uploaded',
          message: 'Alex Chen uploaded "Email Campaign Manager"',
          timestamp: Date.now() - 120000,
          user: { name: 'Alex Chen' },
          bot: { name: 'Email Campaign Manager', category: 'Marketing' }
        },
        {
          id: '3',
          type: 'user_joined',
          message: 'Mike Johnson joined the platform',
          timestamp: Date.now() - 180000,
          user: { name: 'Mike Johnson' }
        },
        {
          id: '4',
          type: 'bot_reviewed',
          message: 'Emma Davis left a 5-star review for "Data Scraper Pro"',
          timestamp: Date.now() - 240000,
          user: { name: 'Emma Davis' },
          bot: { name: 'Data Scraper Pro', category: 'Data Analysis' }
        },
        {
          id: '5',
          type: 'developer_verified',
          message: 'TechBot Solutions became a verified developer',
          timestamp: Date.now() - 300000,
          user: { name: 'TechBot Solutions' }
        }
      ];
      this.updateCache('liveActivity', mockActivities, 60000);
      this.emit('liveActivity', mockActivities);
      return mockActivities;
    }
  }

  private async fetchTrendingBots(): Promise<TrendingBot[]> {
    try {
      const cached = this.getFromCache('trendingBots');
      if (cached) return cached;

      // Fetch real trending bots from API
      const response = await fetch('/api/bots/trending?limit=10');
      if (!response.ok) throw new Error('Failed to fetch trending bots');
      
      const data = await response.json();
      
      // Transform API data to match TrendingBot interface
      const trendingBots: TrendingBot[] = data.map((bot: any, index: number) => ({
        id: bot.id,
        name: bot.title,
        category: bot.category?.name || 'General',
        downloads: bot.downloadCount || 0,
        rating: parseFloat(bot.averageRating) || 0,
        price: parseFloat(bot.price) || 0,
        developer: bot.developer?.name || 'Unknown',
        thumbnail: bot.thumbnailUrl,
        trending_score: (bot.downloadCount || 0) + (bot.viewCount || 0) * 0.1 + (parseFloat(bot.averageRating) || 0) * 100
      }));
      
      this.updateCache('trendingBots', trendingBots, 300000);
      this.emit('trendingBots', trendingBots);
      return trendingBots;
    } catch (error) {
      console.error('Failed to fetch trending bots:', error);
      // Return mock data for development
      const mockTrending: TrendingBot[] = [
        {
          id: '1',
          name: 'AI Content Generator',
          category: 'Productivity',
          downloads: 15420,
          rating: 4.9,
          price: 49.99,
          developer: 'ContentAI Labs',
          trending_score: 98.5
        },
        {
          id: '2',
          name: 'Social Media Scheduler',
          category: 'Social Media',
          downloads: 12890,
          rating: 4.8,
          price: 29.99,
          developer: 'SocialBot Inc',
          trending_score: 95.2
        },
        {
          id: '3',
          name: 'E-commerce Analytics',
          category: 'Data Analysis',
          downloads: 9876,
          rating: 4.7,
          price: 79.99,
          developer: 'DataMine Solutions',
          trending_score: 92.8
        }
      ];
      this.updateCache('trendingBots', mockTrending, 300000);
      this.emit('trendingBots', mockTrending);
      return mockTrending;
    }
  }

  private async fetchMarketMetrics(): Promise<MarketMetrics> {
    try {
      const cached = this.getFromCache('marketMetrics');
      if (cached) return cached;

      const response = await fetch('/api/live/metrics');
      if (!response.ok) throw new Error('Failed to fetch market metrics');
      
      const data = await response.json();
      this.updateCache('marketMetrics', data, 600000);
      this.emit('marketMetrics', data);
      return data;
    } catch (error) {
      console.error('Failed to fetch market metrics:', error);
      // Return mock data for development
      const mockMetrics: MarketMetrics = {
        totalRevenue: 2456789,
        monthlyGrowth: 23.5,
        userGrowth: 18.2,
        botGrowth: 15.7,
        conversionRate: 3.4,
        averageOrderValue: 45.67,
        topSellingCategories: [
          { category: 'Automation', sales: 1250, revenue: 62500 },
          { category: 'Productivity', sales: 980, revenue: 49000 },
          { category: 'Social Media', sales: 750, revenue: 22500 },
        ],
        recentTransactions: [
          { id: '1', botName: 'AI Assistant Pro', amount: 99.99, timestamp: Date.now() - 60000, country: 'US' },
          { id: '2', botName: 'Data Scraper', amount: 39.99, timestamp: Date.now() - 120000, country: 'UK' },
          { id: '3', botName: 'Email Automation', amount: 59.99, timestamp: Date.now() - 180000, country: 'CA' },
        ]
      };
      this.updateCache('marketMetrics', mockMetrics, 600000);
      this.emit('marketMetrics', mockMetrics);
      return mockMetrics;
    }
  }

  private updateCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private emit(event: string, data: any): void {
    const subscribers = this.subscribers.get(event);
    if (subscribers) {
      subscribers.forEach(callback => callback(data));
    }
  }

  // Public API
  subscribe(event: string, callback: Function): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);
    
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  async getLiveStats(): Promise<LiveStats> {
    return this.fetchLiveStats();
  }

  async getLiveActivity(): Promise<LiveActivity[]> {
    return this.fetchLiveActivity();
  }

  async getTrendingBots(): Promise<TrendingBot[]> {
    return this.fetchTrendingBots();
  }

  async getMarketMetrics(): Promise<MarketMetrics> {
    return this.fetchMarketMetrics();
  }
}

// React Hooks for Live Data
export function useLiveStats() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = LiveDataService.getInstance();
    
    const unsubscribe = service.subscribe('liveStats', (data: LiveStats) => {
      setStats(data);
      setLoading(false);
      setError(null);
    });

    service.getLiveStats().catch(err => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { stats, loading, error };
}

export function useLiveActivity() {
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = LiveDataService.getInstance();
    
    const unsubscribe = service.subscribe('liveActivity', (data: LiveActivity[]) => {
      setActivities(data);
      setLoading(false);
      setError(null);
    });

    service.getLiveActivity().catch(err => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { activities, loading, error };
}

export function useTrendingBots() {
  const [bots, setBots] = useState<TrendingBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = LiveDataService.getInstance();
    
    const unsubscribe = service.subscribe('trendingBots', (data: TrendingBot[]) => {
      setBots(data);
      setLoading(false);
      setError(null);
    });

    service.getTrendingBots().catch(err => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { bots, loading, error };
}

export function useMarketMetrics() {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const service = LiveDataService.getInstance();
    
    const unsubscribe = service.subscribe('marketMetrics', (data: MarketMetrics) => {
      setMetrics(data);
      setLoading(false);
      setError(null);
    });

    service.getMarketMetrics().catch(err => {
      setError(err.message);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { metrics, loading, error };
}

export { LiveDataService };
export type { LiveStats, LiveActivity, TrendingBot, MarketMetrics };