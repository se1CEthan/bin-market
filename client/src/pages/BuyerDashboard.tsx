import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag, 
  Star, 
  TrendingUp, 
  Search,
  Download,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Bot } from '@shared/schema';
import { useState } from 'react';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: purchases } = useQuery<any[]>({
    queryKey: ['/api/account/purchases'],
    enabled: !!user,
  });

  const { data: trendingBots } = useQuery<(Bot & {
    developer: { name: string };
    category: { name: string };
  })[]>({
    queryKey: ['/api/bots/trending'],
  });

  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/bots?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover powerful automation bots to streamline your workflow
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for WhatsApp bots, Instagram automation, web scrapers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button type="submit" size="lg" className="px-8">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{purchases?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Bots Purchased</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{trendingBots?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Available Bots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{categories?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Purchases */}
        {purchases && purchases.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  My Purchased Bots
                </CardTitle>
                <Button variant="outline" asChild>
                  <Link href="/account/purchases">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {purchases.slice(0, 3).map((purchase: any) => (
                  <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {purchase.bot?.thumbnailUrl && (
                        <img
                          src={purchase.bot.thumbnailUrl}
                          alt={purchase.bot.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="font-semibold mb-2">{purchase.bot?.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Clock className="h-4 w-4" />
                        Purchased {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/bot/${purchase.bot?.id}`}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Browse by Category */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories?.slice(0, 8).map((category) => (
                <Link key={category.id} href={`/bots?category=${category.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{category.icon || '🤖'}</div>
                      <p className="font-semibold mb-1">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.botCount} bots
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Bots */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Bots
              </CardTitle>
              <Button variant="outline" asChild>
                <Link href="/bots">
                  Browse All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingBots?.slice(0, 4).map((bot) => (
                <Link key={bot.id} href={`/bot/${bot.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full">
                    <CardContent className="p-4">
                      {bot.thumbnailUrl && (
                        <img
                          src={bot.thumbnailUrl}
                          alt={bot.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <Badge className="mb-2">{bot.category.name}</Badge>
                      <h3 className="font-semibold mb-2 line-clamp-2">{bot.title}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-semibold">
                            {bot.averageRating || '0.00'}
                          </span>
                        </div>
                        <span className="font-mono text-lg font-bold text-primary">
                          ${bot.price}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        by {bot.developer.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-6 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">Find the Perfect Bot</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our marketplace of automation bots
              </p>
              <Button asChild className="w-full">
                <Link href="/bots">Browse Bots</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <h3 className="font-semibold mb-2">Compare Bots</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Compare features side-by-side
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/bots/compare">Compare Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with sellers before buying
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/bots">Get Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
