import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  User,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  botId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    avatarUrl: string | null;
  };
}

interface ChatSystemProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  botId?: string;
  botTitle?: string;
}

export function ChatSystem({ 
  recipientId, 
  recipientName, 
  recipientAvatar,
  botId,
  botTitle 
}: ChatSystemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Connect to WebSocket
  useEffect(() => {
    if (!user || !isOpen) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      // Register user
      websocket.send(JSON.stringify({
        type: 'register',
        userId: user.id
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [user, isOpen]);

  // Load chat history
  const { data: chatHistory } = useQuery<Message[]>({
    queryKey: ['/api/chat/messages', user?.id, recipientId],
    enabled: !!user && isOpen,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  useEffect(() => {
    if (chatHistory) {
      setMessages(chatHistory);
      scrollToBottom();
    }
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = () => {
    if (!message.trim() || !ws || !user) return;

    const messageData = {
      type: 'send_message',
      senderId: user.id,
      receiverId: recipientId,
      botId: botId || null,
      message: message.trim()
    };

    ws.send(JSON.stringify(messageData));
    setMessage('');
    
    // Focus back on input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <Button variant="outline" disabled>
        <MessageSquare className="h-4 w-4 mr-2" />
        Sign in to chat
      </Button>
    );
  }

  if (user.id === recipientId) {
    return null; // Don't show chat to message yourself
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Message {recipientName}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`fixed bottom-4 right-4 z-50 bg-background border-2 border-border rounded-lg shadow-2xl transition-all ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={recipientAvatar || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {recipientName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{recipientName}</p>
                {botTitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    About: {botTitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <ScrollArea className="h-[calc(600px-120px)] p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={isOwn ? user.avatarUrl || undefined : recipientAvatar || undefined} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {isOwn ? user.name.charAt(0) : recipientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {msg.message}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
