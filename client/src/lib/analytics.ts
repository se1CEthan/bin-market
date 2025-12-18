/**
 * Advanced Analytics & Monitoring System
 * Comprehensive user behavior tracking and performance monitoring
 */

import { useEffect, useRef, useCallback } from 'react';

// Analytics Event Types
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
}

interface UserSession {
  id: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: AnalyticsEvent[];
  userId?: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
  memoryUsage?: number;
  connectionType?: string;
}

// Advanced Analytics Manager
export class AdvancedAnalytics {
  private static instance: AdvancedAnalytics;
  private session: UserSession;
  private queue: AnalyticsEvent[] = [];
  private isOnline = navigator.onLine;
  private performanceObserver?: PerformanceObserver;
  private intersectionObserver?: IntersectionObserver;
  private visibilityStartTime = Date.now();
  private heatmapData: Array<{ x: number; y: number; timestamp: number }> = [];
  
  private constructor() {
    this.session = this.initializeSession();
    this.setupEventListeners();
    this.setupPerformanceMonitoring();
    this.setupHeatmapTracking();
    this.startSessionTracking();
  }

  static getInstance(): AdvancedAnalytics {
    if (!this.instance) {
      this.instance = new AdvancedAnalytics();
    }
    return this.instance;
  }

  private initializeSession(): UserSession {
    const sessionId = this.generateSessionId();
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      id: sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 1,
      events: [],
      referrer: document.referrer,
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  private setupEventListeners(): void {
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden', {
          timeOnPage: Date.now() - this.visibilityStartTime,
        });
      } else {
        this.visibilityStartTime = Date.now();
        this.track('page_visible');
      }
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page unload
    window.addEventListener('beforeunload', () => {
      this.track('page_unload', {
        sessionDuration: Date.now() - this.session.startTime,
        totalEvents: this.session.events.length,
      });
      this.flushQueue();
    });

    // Error tracking
    window.addEventListener('error', (event) => {
      this.track('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // User interactions
    ['click', 'scroll', 'keydown', 'mousemove'].forEach(eventType => {
      document.addEventListener(eventType, this.throttle(() => {
        this.updateLastActivity();
      }, 1000));
    });
  }

  private setupPerformanceMonitoring(): void {
    // Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.track('performance_metric', {
          metric: 'largest_contentful_paint',
          value: lastEntry.startTime,
        });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.track('performance_metric', {
            metric: 'first_input_delay',
            value: entry.processingStart - entry.startTime,
          });
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.track('performance_metric', {
          metric: 'cumulative_layout_shift',
          value: clsValue,
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const metrics: PerformanceMetrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          firstInputDelay: 0,
          cumulativeLayoutShift: 0,
          timeToInteractive: 0,
        };

        // Memory usage (if available)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          metrics.memoryUsage = memory.usedJSHeapSize;
        }

        // Connection type (if available)
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          metrics.connectionType = connection.effectiveType;
        }

        this.track('page_performance', metrics);
      }, 0);
    });
  }

  private setupHeatmapTracking(): void {
    let lastMouseMove = 0;
    document.addEventListener('mousemove', this.throttle((event: MouseEvent) => {
      this.heatmapData.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now(),
      });

      // Keep only recent data (last 1000 points)
      if (this.heatmapData.length > 1000) {
        this.heatmapData = this.heatmapData.slice(-1000);
      }
    }, 100));

    // Track clicks with more detail
    document.addEventListener('click', (event) => {
      const target = event.target as Element;
      this.track('click', {
        x: event.clientX,
        y: event.clientY,
        element: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 100),
      });
    });
  }

  private startSessionTracking(): void {
    // Send session data every 30 seconds
    setInterval(() => {
      this.track('session_heartbeat', {
        sessionDuration: Date.now() - this.session.startTime,
        eventsCount: this.session.events.length,
        pageViews: this.session.pageViews,
      });
    }, 30000);
  }

  private updateLastActivity(): void {
    this.session.lastActivity = Date.now();
  }

  private throttle(func: Function, limit: number) {
    let inThrottle: boolean;
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Public API
  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      sessionId: this.session.id,
      userId: this.session.userId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.session.events.push(event);
    this.queue.push(event);

    // Auto-flush if queue gets too large
    if (this.queue.length >= 10) {
      this.flushQueue();
    }
  }

  identify(userId: string, traits?: Record<string, any>): void {
    this.session.userId = userId;
    this.track('user_identified', { userId, ...traits });
  }

  page(name?: string, properties?: Record<string, any>): void {
    this.session.pageViews++;
    this.visibilityStartTime = Date.now();
    
    this.track('page_view', {
      page: name || window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      ...properties,
    });
  }

  // A/B Testing
  experiment(experimentName: string, variant: string, properties?: Record<string, any>): void {
    this.track('experiment_viewed', {
      experiment: experimentName,
      variant,
      ...properties,
    });
  }

  // Conversion tracking
  conversion(goalName: string, value?: number, properties?: Record<string, any>): void {
    this.track('conversion', {
      goal: goalName,
      value,
      ...properties,
    });
  }

  // Custom metrics
  metric(name: string, value: number, unit?: string): void {
    this.track('custom_metric', {
      metric: name,
      value,
      unit,
    });
  }

  // Heatmap data
  getHeatmapData(): Array<{ x: number; y: number; timestamp: number }> {
    return [...this.heatmapData];
  }

  // Session data
  getSession(): UserSession {
    return { ...this.session };
  }

  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0 || !this.isOnline) {
      return;
    }

    const events = [...this.queue];
    this.queue = [];

    try {
      // In production, send to analytics service
      await this.sendEvents(events);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-queue events for retry
      this.queue.unshift(...events);
    }
  }

  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    // Mock implementation - replace with actual analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics events:', events);
      return;
    }

    // Example: Send to your analytics endpoint
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        session: this.session,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analytics request failed: ${response.status}`);
    }
  }
}

// React Hooks for Analytics
export function useAnalytics() {
  const analytics = AdvancedAnalytics.getInstance();

  const track = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, [analytics]);

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    analytics.identify(userId, traits);
  }, [analytics]);

  const page = useCallback((name?: string, properties?: Record<string, any>) => {
    analytics.page(name, properties);
  }, [analytics]);

  const experiment = useCallback((experimentName: string, variant: string, properties?: Record<string, any>) => {
    analytics.experiment(experimentName, variant, properties);
  }, [analytics]);

  const conversion = useCallback((goalName: string, value?: number, properties?: Record<string, any>) => {
    analytics.conversion(goalName, value, properties);
  }, [analytics]);

  const metric = useCallback((name: string, value: number, unit?: string) => {
    analytics.metric(name, value, unit);
  }, [analytics]);

  return {
    track,
    identify,
    page,
    experiment,
    conversion,
    metric,
  };
}

// Page tracking hook
export function usePageTracking() {
  const { page } = useAnalytics();
  const currentPath = useRef(window.location.pathname);

  useEffect(() => {
    // Track initial page view
    page();

    // Track route changes
    const handleRouteChange = () => {
      if (window.location.pathname !== currentPath.current) {
        currentPath.current = window.location.pathname;
        page();
      }
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    // For SPA routing, you might need to listen to your router's events
    // This is a simple approach that checks periodically
    const interval = setInterval(handleRouteChange, 1000);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      clearInterval(interval);
    };
  }, [page]);
}

// Element visibility tracking
export function useElementTracking(elementRef: React.RefObject<Element>, eventName: string) {
  const { track } = useAnalytics();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            track(eventName, {
              element: entry.target.tagName,
              className: entry.target.className,
              id: entry.target.id,
              intersectionRatio: entry.intersectionRatio,
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, eventName, track]);
}

// Form analytics
export function useFormTracking(formName: string) {
  const { track } = useAnalytics();

  const trackFormStart = useCallback(() => {
    track('form_started', { form: formName });
  }, [track, formName]);

  const trackFormSubmit = useCallback((success: boolean, errors?: string[]) => {
    track('form_submitted', {
      form: formName,
      success,
      errors,
    });
  }, [track, formName]);

  const trackFieldFocus = useCallback((fieldName: string) => {
    track('form_field_focused', {
      form: formName,
      field: fieldName,
    });
  }, [track, formName]);

  const trackFieldError = useCallback((fieldName: string, error: string) => {
    track('form_field_error', {
      form: formName,
      field: fieldName,
      error,
    });
  }, [track, formName]);

  return {
    trackFormStart,
    trackFormSubmit,
    trackFieldFocus,
    trackFieldError,
  };
}

// Initialize analytics
export function initializeAnalytics() {
  const analytics = AdvancedAnalytics.getInstance();
  
  // Track initial page load
  analytics.page();
  
  return analytics;
}