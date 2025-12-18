import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Download } from 'lucide-react';
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
  return (
    <Link href={`/bot/${bot.id}`}>
      <div data-testid={`card-bot-${bot.id}`} className="cursor-pointer">
        <Card className="hover-elevate active-elevate-2 overflow-hidden group transition-all duration-200">
          <div className="aspect-video relative overflow-hidden bg-muted">
            {bot.thumbnailUrl ? (
              <img
                src={bot.thumbnailUrl}
                alt={bot.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-4xl">🤖</span>
              </div>
            )}
            {bot.isFeatured && (
              <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm">
                Featured
              </Badge>
            )}
          </div>

          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-display font-semibold text-lg line-clamp-1" data-testid={`text-bot-title-${bot.id}`}>
                {bot.title}
              </h3>
              <span className="font-mono font-bold text-lg text-primary whitespace-nowrap" data-testid={`text-bot-price-${bot.id}`}>
                ${bot.price}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {bot.description}
            </p>

            <div className="flex items-center gap-2 mb-3">
              {bot.developer && (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={bot.developer.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {bot.developer.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{bot.developer.name}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span data-testid={`text-bot-rating-${bot.id}`}>{bot.averageRating || '0.00'}</span>
                <span>({bot.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span data-testid={`text-bot-downloads-${bot.id}`}>{bot.downloadCount}</span>
              </div>
            </div>
          </CardContent>

          {bot.category && (
            <CardFooter className="p-4 pt-0">
              <Badge variant="secondary" className="text-xs">
                {bot.category.name}
              </Badge>
            </CardFooter>
          )}
        </Card>
      </div>
    </Link>
  );
}
