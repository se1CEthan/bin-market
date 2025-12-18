/**
 * Advanced Real-time Features & WebSocket Enhancement
 * Implements cutting-edge real-time communication and collaboration
 */

import { useEffect, useState, useCallback, useRef } from 'react';

// Real-time Event Types
interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

interface UserPresence {
  userId: string;
  username: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
  currentPage: string;
  cursor?: { x: number; y: number };
}

interface LiveActivity {
  id: string;
  type: 'bot_view' | 'bot_purchase' | 'user_join' | 'user_leave' | 'chat_message';
  userId: string;
  username: string;
  data: any;
  timestamp: number;
}

// Advanced WebSocket Manager
export class AdvancedWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: RealtimeEvent[] = [];
  private eventHandlers = new Map<string, Set<Function>>();
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  
  constructor(private url: string, private options: {
    autoReconnect?: boolean;
    heartbeatInterval?: number;
    maxReconnectAttempts?: number;
  } = {}) {
    this.options = {
      autoReconnect: true,
      heartbeatInterval: 30000,
      maxReconnectAttempts: 5,
      ...options,
    };
  }
  
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }
      
      this.connectionState = 'connecting';
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.flushMessageQueue();
        this.emit('connection', { status: 'connected' });
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        this.connectionState = 'disconnected';
        this.stopHeartbeat();
        this.emit('connection', { status: 'disconnected', code: event.code });
        
        if (this.options.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
      
      this.ws.onerror = (error) => {
        this.connectionState = 'error';
        this.emit('connection', { status: 'error', error });
        reject(error);
      };
    });
  }
  
  disconnect(): void {
    this.options.autoReconnect = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  send(event: Omit<RealtimeEvent, 'timestamp' | 'sessionId'>): void {
    const message: RealtimeEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.generateSessionId(),
    };
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }
  
  on(eventType: string, handler: Function): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
    
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }
  
  private emit(eventType: string, data: any): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
  
  private handleMessage(data: RealtimeEvent): void {
    this.emit(data.type, data);
    this.emit('message', data);
  }
  
  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'heartbeat', data: {} });
      }
    }, this.options.heartbeatInterval);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  private scheduleReconnect(): void {
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch(() => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.emit('connection', { status: 'failed', attempts: this.reconnectAttempts });
        }
      });
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }
  
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.ws?.send(JSON.stringify(message));
    }
  }
  
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  getConnectionState(): string {
    return this.connectionState;
  }
}

// Real-time Presence System
export class PresenceManager {
  private presence = new Map<string, UserPresence>();
  private currentUser: UserPresence | null = null;
  private wsManager: AdvancedWebSocketManager;
  private updateInterval: NodeJS.Timeout | null = null;
  
  constructor(wsManager: AdvancedWebSocketManager) {
    this.wsManager = wsManager;
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.wsManager.on('user_presence', (data: { user: UserPresence }) => {
      this.presence.set(data.user.userId, data.user);
    });
    
    this.wsManager.on('user_left', (data: { userId: string }) => {
      this.presence.delete(data.userId);
    });
    
    this.wsManager.on('cursor_move', (data: { userId: string; cursor: { x: number; y: number } }) => {
      const user = this.presence.get(data.userId);
      if (user) {
        user.cursor = data.cursor;
        this.presence.set(data.userId, user);
      }
    });
  }
  
  setCurrentUser(user: Omit<UserPresence, 'lastSeen'>): void {
    this.currentUser = {
      ...user,
      lastSeen: Date.now(),
    };
    
    this.wsManager.send({
      type: 'user_presence',
      data: { user: this.currentUser },
    });
    
    this.startPresenceUpdates();
  }
  
  updateStatus(status: UserPresence['status']): void {
    if (this.currentUser) {
      this.currentUser.status = status;
      this.currentUser.lastSeen = Date.now();
      
      this.wsManager.send({
        type: 'user_presence',
        data: { user: this.currentUser },
      });
    }
  }
  
  updateCurrentPage(page: string): void {
    if (this.currentUser) {
      this.currentUser.currentPage = page;
      this.currentUser.lastSeen = Date.now();
      
      this.wsManager.send({
        type: 'user_presence',
        data: { user: this.currentUser },
      });
    }
  }
  
  updateCursor(x: number, y: number): void {
    if (this.currentUser) {
      this.currentUser.cursor = { x, y };
      
      this.wsManager.send({
        type: 'cursor_move',
        data: { userId: this.currentUser.userId, cursor: { x, y } },
      });
    }
  }
  
  getOnlineUsers(): UserPresence[] {
    return Array.from(this.presence.values()).filter(
      user => user.status !== 'offline' && Date.now() - user.lastSeen < 300000 // 5 minutes
    );
  }
  
  getUsersOnPage(page: string): UserPresence[] {
    return this.getOnlineUsers().filter(user => user.currentPage === page);
  }
  
  private startPresenceUpdates(): void {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      if (this.currentUser) {
        this.currentUser.lastSeen = Date.now();
        this.wsManager.send({
          type: 'user_presence',
          data: { user: this.currentUser },
        });
      }
    }, 60000); // Update every minute
  }
  
  destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    if (this.currentUser) {
      this.wsManager.send({
        type: 'user_left',
        data: { userId: this.currentUser.userId },
      });
    }
  }
}

// Live Activity Feed
export class LiveActivityManager {
  private activities: LiveActivity[] = [];
  private maxActivities = 100;
  private wsManager: AdvancedWebSocketManager;
  private subscribers = new Set<(activities: LiveActivity[]) => void>();
  
  constructor(wsManager: AdvancedWebSocketManager) {
    this.wsManager = wsManager;
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.wsManager.on('live_activity', (data: { activity: LiveActivity }) => {
      this.addActivity(data.activity);
    });
  }
  
  private addActivity(activity: LiveActivity): void {
    this.activities.unshift(activity);
    
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(0, this.maxActivities);
    }
    
    this.notifySubscribers();
  }
  
  broadcastActivity(activity: Omit<LiveActivity, 'id' | 'timestamp'>): void {
    const fullActivity: LiveActivity = {
      ...activity,
      id: this.generateId(),
      timestamp: Date.now(),
    };
    
    this.wsManager.send({
      type: 'live_activity',
      data: { activity: fullActivity },
    });
    
    this.addActivity(fullActivity);
  }
  
  subscribe(callback: (activities: LiveActivity[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.activities);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }
  
  getActivities(type?: string, limit?: number): LiveActivity[] {
    let filtered = this.activities;
    
    if (type) {
      filtered = filtered.filter(activity => activity.type === type);
    }
    
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  }
  
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.activities));
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Real-time Collaboration
export class CollaborationManager {
  private wsManager: AdvancedWebSocketManager;
  private collaborators = new Map<string, any>();
  private sharedState = new Map<string, any>();
  
  constructor(wsManager: AdvancedWebSocketManager) {
    this.wsManager = wsManager;
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.wsManager.on('state_update', (data: { key: string; value: any; userId: string }) => {
      this.sharedState.set(data.key, data.value);
      this.emit('stateChange', { key: data.key, value: data.value, userId: data.userId });
    });
    
    this.wsManager.on('collaborator_join', (data: { user: any }) => {
      this.collaborators.set(data.user.id, data.user);
      this.emit('collaboratorJoin', data.user);
    });
    
    this.wsManager.on('collaborator_leave', (data: { userId: string }) => {
      this.collaborators.delete(data.userId);
      this.emit('collaboratorLeave', data.userId);
    });
  }
  
  updateSharedState(key: string, value: any): void {
    this.sharedState.set(key, value);
    
    this.wsManager.send({
      type: 'state_update',
      data: { key, value },
    });
  }
  
  getSharedState(key: string): any {
    return this.sharedState.get(key);
  }
  
  getCollaborators(): any[] {
    return Array.from(this.collaborators.values());
  }
  
  private emit(event: string, data: any): void {
    // Emit to local event system
    window.dispatchEvent(new CustomEvent(`collaboration:${event}`, { detail: data }));
  }
}

// Hooks for Real-time Features
export function useRealtime(url: string) {
  const [wsManager] = useState(() => new AdvancedWebSocketManager(url));
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const unsubscribe = wsManager.on('connection', (data: any) => {
      setConnectionState(data.status);
      setIsConnected(data.status === 'connected');
    });
    
    wsManager.connect().catch(console.error);
    
    return () => {
      unsubscribe();
      wsManager.disconnect();
    };
  }, [wsManager]);
  
  const sendMessage = useCallback((type: string, data: any) => {
    wsManager.send({ type, data });
  }, [wsManager]);
  
  const subscribe = useCallback((eventType: string, handler: Function) => {
    return wsManager.on(eventType, handler);
  }, [wsManager]);
  
  return {
    wsManager,
    connectionState,
    isConnected,
    sendMessage,
    subscribe,
  };
}

export function usePresence(wsManager: AdvancedWebSocketManager) {
  const [presenceManager] = useState(() => new PresenceManager(wsManager));
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [currentPageUsers, setCurrentPageUsers] = useState<UserPresence[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers(presenceManager.getOnlineUsers());
      setCurrentPageUsers(presenceManager.getUsersOnPage(window.location.pathname));
    }, 5000);
    
    // Track cursor movement
    const handleMouseMove = (e: MouseEvent) => {
      presenceManager.updateCursor(e.clientX, e.clientY);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousemove', handleMouseMove);
      presenceManager.destroy();
    };
  }, [presenceManager]);
  
  const setUser = useCallback((user: Omit<UserPresence, 'lastSeen'>) => {
    presenceManager.setCurrentUser(user);
  }, [presenceManager]);
  
  const updateStatus = useCallback((status: UserPresence['status']) => {
    presenceManager.updateStatus(status);
  }, [presenceManager]);
  
  const updatePage = useCallback((page: string) => {
    presenceManager.updateCurrentPage(page);
  }, [presenceManager]);
  
  return {
    onlineUsers,
    currentPageUsers,
    setUser,
    updateStatus,
    updatePage,
  };
}

export function useLiveActivity(wsManager: AdvancedWebSocketManager) {
  const [activityManager] = useState(() => new LiveActivityManager(wsManager));
  const [activities, setActivities] = useState<LiveActivity[]>([]);
  
  useEffect(() => {
    const unsubscribe = activityManager.subscribe(setActivities);
    return unsubscribe;
  }, [activityManager]);
  
  const broadcastActivity = useCallback((activity: Omit<LiveActivity, 'id' | 'timestamp'>) => {
    activityManager.broadcastActivity(activity);
  }, [activityManager]);
  
  const getActivitiesByType = useCallback((type: string, limit?: number) => {
    return activityManager.getActivities(type, limit);
  }, [activityManager]);
  
  return {
    activities,
    broadcastActivity,
    getActivitiesByType,
  };
}

export function useCollaboration(wsManager: AdvancedWebSocketManager) {
  const [collaborationManager] = useState(() => new CollaborationManager(wsManager));
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [sharedState, setSharedState] = useState<Map<string, any>>(new Map());
  
  useEffect(() => {
    const handleCollaboratorJoin = (e: CustomEvent) => {
      setCollaborators(prev => [...prev, e.detail]);
    };
    
    const handleCollaboratorLeave = (e: CustomEvent) => {
      setCollaborators(prev => prev.filter(c => c.id !== e.detail));
    };
    
    const handleStateChange = (e: CustomEvent) => {
      setSharedState(prev => new Map(prev.set(e.detail.key, e.detail.value)));
    };
    
    window.addEventListener('collaboration:collaboratorJoin', handleCollaboratorJoin as EventListener);
    window.addEventListener('collaboration:collaboratorLeave', handleCollaboratorLeave as EventListener);
    window.addEventListener('collaboration:stateChange', handleStateChange as EventListener);
    
    return () => {
      window.removeEventListener('collaboration:collaboratorJoin', handleCollaboratorJoin as EventListener);
      window.removeEventListener('collaboration:collaboratorLeave', handleCollaboratorLeave as EventListener);
      window.removeEventListener('collaboration:stateChange', handleStateChange as EventListener);
    };
  }, []);
  
  const updateState = useCallback((key: string, value: any) => {
    collaborationManager.updateSharedState(key, value);
  }, [collaborationManager]);
  
  const getState = useCallback((key: string) => {
    return collaborationManager.getSharedState(key);
  }, [collaborationManager]);
  
  return {
    collaborators,
    sharedState,
    updateState,
    getState,
  };
}