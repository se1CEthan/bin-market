import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BotCard } from '@/components/BotCard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Zap, 
  Shield, 
  DollarSign, 
  TrendingUp,
  MessageSquare,
  Instagram,
  Bot as BotIcon,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Download,
  Star
} from 'lucide-react';
import type { Bot, Category } from '@shared/schema';

export default function Home() {
  const { user } = useAuth();

  const { data: trendingBots, isLoading: botsLoading } = useQuery<(Bot & { developer: { name: string; avatarUrl: string | null }; category: { name: string } })[]>({
    queryKey: ['/api/bots/trending'],
  });

  const { data: personalizedFeed } = useQuery({
    queryKey: ['/api/recommendations/feed'],
    enabled: !!user,
  });

  const { data: aiRecommendations } = useQuery({
    queryKey: ['/api/recommendations/user'],
    enabled: !!user,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: stats } = useQuery<{ totalBots: number; totalDevelopers: number; totalDownloads: number }>({
    queryKey: ['/api/stats'],
  });

  const categoryIcons = {
    'WhatsApp': MessageSquare,
    'Instagram': Instagram,
    'Scrapers': BotIcon,
    'Business Tools': Briefcase,
    'AI Tools': Sparkles,
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-4 md:px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="mb-4" data-testid="badge-hero-label">
              <Zap className="h-3 w-3 mr-1" />
              90% Earnings for Developers
            </Badge>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight" data-testid="text-hero-title">
              Buy Smarter. Build Faster.{' '}
              <span className="text-primary">Automate Everything.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              The leading marketplace for automation bots. Buy ready-made bots or sell yours and keep 90% profit.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="button-browse-bots">
                <Link href="/bots">
                  Browse Bots
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-sell-bot">
                <Link href={user?.isDeveloper ? "/developer/upload" : "/developer/signup"}>
                  Sell Your Bot
                </Link>
              </Button>
            </div>

            {/* Trust indicators */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto pt-8">
                <div className="text-center">
                  <div className="font-mono text-2xl md:text-3xl font-bold text-primary" data-testid="text-stat-bots">
                    {stats.totalBots}+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Bots Available</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl md:text-3xl font-bold text-primary" data-testid="text-stat-developers">
                    {stats.totalDevelopers}+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Developers</div>
                </div>
                <div className="text-center">
                  <div className="font-mono text-2xl md:text-3xl font-bold text-primary" data-testid="text-stat-downloads">
                    {stats.totalDownloads}+
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">Downloads</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Why Choose BIN?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The most developer-friendly marketplace with the lowest fees in the industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Instant Downloads</h3>
              <p className="text-sm text-muted-foreground">
                Buy a bot and use it within minutes. No waiting, no hassle.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Keep 90% as Developer</h3>
              <p className="text-sm text-muted-foreground">
                Low fees. You build it, you keep most of it.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Safe & Verified</h3>
              <p className="text-sm text-muted-foreground">
                Every bot is screened before approval. No malware, no junk.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Custom Bots On Demand</h3>
              <p className="text-sm text-muted-foreground">
                Can't find what you need? Hire developers directly from the platform.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {user && personalizedFeed && personalizedFeed.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-purple-500" />
                  Recommended for You
                </h2>
                <p className="text-muted-foreground">AI-powered recommendations based on your interests</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {personalizedFeed.slice(0, 8).map((recommendation: any) => (
                <div key={recommendation.bot.id} className="relative">
                  <BotCard bot={recommendation.bot} />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-purple-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {Math.round(recommendation.confidence * 100)}% match
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-center">
                    {recommendation.reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Bots */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Trending Bots</h2>
              <p className="text-muted-foreground">Most popular automation bots this week</p>
            </div>
            <Button variant="outline" asChild data-testid="button-view-all-bots">
              <Link href="/bots">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {botsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trendingBots && trendingBots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingBots.slice(0, 8).map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BotIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No bots available yet. Be the first to upload!</p>
            </Card>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Browse by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect automation bot for your specific needs
            </p>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </Card>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || BotIcon;
                return (
                  <Link key={category.id} href={`/bots?category=${category.id}`}>
                    <div data-testid={`card-category-${category.id}`} className="cursor-pointer">
                      <Card className="p-6 hover-elevate active-elevate-2 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.botCount} bots</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </Card>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes, whether you're buying or selling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-xl">Browse & Search</h3>
              <p className="text-muted-foreground">
                Explore our marketplace and find the perfect automation bot for your needs
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-xl">Secure Purchase</h3>
              <p className="text-muted-foreground">
                Buy with confidence using PayPal. Instant payment processing and secure transactions
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-xl">Download & Use</h3>
              <p className="text-muted-foreground">
                Get instant access to your bot. Download, install, and start automating immediately
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-transparent to-transparent relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="container relative mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Ready to Automate Your Life or Start Earning?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers and developers on the BIN marketplace
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild data-testid="button-cta-browse">
                <Link href="/bots">
                  Browse Bots
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-cta-developer">
                <Link href={user?.isDeveloper ? "/developer/upload" : "/developer/signup"}>
                  Become a Developer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
