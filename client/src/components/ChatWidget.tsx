import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender?: {
    name: string;
    avatarUrl: string | null;
  };
}

interface ChatWidgetProps {
  receiverId?: string;
  receiverName?: string;
  receiverAvatar?: string | null;
}

export function ChatWidget({ receiverId, receiverName, receiverAvatar }: ChatWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Chat WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !wsRef.current || !receiverId) return;

    const messageData = {
      type: 'send_message',
      receiverId,
      message: message.trim(),
    };

    wsRef.current.send(JSON.stringify(messageData));
    setMessage('');
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <Button
        size="lg"
        className="fixed bottom-4 right-4 rounded-full shadow-lg z-50"
        onClick={() => setIsOpen(true)}
        data-testid="button-open-chat"
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Chat
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={receiverAvatar || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {receiverName?.charAt(0).toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{receiverName || 'Chat'}</h3>
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          data-testid="button-close-chat"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.senderId === user.id ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={msg.sender?.avatarUrl || undefined} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {msg.sender?.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`px-3 py-2 rounded-lg max-w-[70%] ${
                    msg.senderId === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            data-testid="input-chat-message"
          />
          <Button type="submit" size="icon" data-testid="button-send-message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
