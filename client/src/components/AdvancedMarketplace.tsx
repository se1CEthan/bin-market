/**
 * Advanced Marketplace Component
 * Revolutionary marketplace interface with live features
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingBots } from '@/components/TrendingBots';
import { LiveActivityFeed } from '@/components/LiveActivityFeed';
import { AdvancedSpinner } from '@/components/ui/advanced-loading';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Star, 
  Download, 
  Eye,
  Zap,
  Bot,
  Users,
  Globe,
  Sparkles,
  
  Grid3X3,
  List,
  BarChart3,
  Clock,
  Flame,
  Crown,
  Target,
  Rocket,
  ArrowRight
} from 'lucide-react';
import { useLiveStats, useTrendingBots, useLiveActivity } from '@/lib/live-data';
import { cn } from '@/lib/utils';

interface MarketplaceSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  count?: number;
}

export function AdvancedMarketplace({ className }: { className?: string }) {
  const [activeSection, setActiveSection] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { stats } = useLiveStats();
  const { bots: trendingBots } = useTrendingBots();
  const { activities } = useLiveActivity();

  const sections: MarketplaceSection[] = [
    {
      id: 'trending',
      title: 'Trending Now',
      description: 'Hottest bots gaining popularity',
      icon: Flame,
      color: 'text-orange-500',
      count: trendingBots?.length || 0
    },
    {
      id: 'featured',
      title: 'Featured',
      description: 'Editor\'s choice and premium bots',
      icon: Crown,
      color: 'text-yellow-500',
      count: 12
    },
    {
      id: 'new',
      title: 'New Releases',
      description: 'Latest bots from developers',
      icon: Sparkles,
      color: 'text-blue-500',
      count: stats?.newBotsThisWeek || 0
    },
    {
      id: 'popular',
      title: 'Most Popular',
      description: 'Highest rated and downloaded',
      icon: Star,
      color: 'text-purple-500',
      count: 25
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Browse by bot type',
      icon: Grid3X3,
      color: 'text-green-500',
      count: stats?.topCategories?.length || 0
    }
  ];

  return (
    <div className={cn("space-y-8", className)}>
      {/* Advanced Header */}
      <motion.div
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 p-4 sm:p-6 lg:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_theme(colors.primary/20),_transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6 space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <motion.h1 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Advanced Marketplace
              </motion.h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">
                Discover, compare, and deploy intelligent automation solutions
              </p>
            </div>
            
            {stats && (
              <div className="flex items-center justify-center lg:justify-end gap-3 sm:gap-4 lg:gap-6 overflow-x-auto">
                <motion.div 
                  className="text-center min-w-0 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                    {stats.onlineUsers.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Online Now</div>
                </motion.div>
                <motion.div 
                  className="text-center min-w-0 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">
                    {stats.totalBots.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Total Bots</div>
                </motion.div>
                <motion.div 
                  className="text-center min-w-0 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-500">
                    {stats.totalDownloads.toLocaleString()}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">Downloads</div>
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Advanced Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search bots, categories, developers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" className="flex items-center gap-2 flex-1 sm:flex-none">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              <div className="flex items-center gap-1 p-1 bg-background/50 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Sections */}
      <motion.div
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className={cn(
              "relative p-3 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-300",
              activeSection === section.id
                ? "bg-primary/10 border-primary/50 shadow-lg"
                : "bg-card hover:bg-muted/50 border-border hover:border-primary/30"
            )}
            onClick={() => setActiveSection(section.id)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                className={cn(
                  "p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20",
                  section.color
                )}
                animate={{ rotate: activeSection === section.id ? [0, 5, -5, 0] : 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <section.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs sm:text-sm truncate">{section.title}</h3>
                <p className="text-xs text-muted-foreground truncate hidden sm:block">{section.description}</p>
              </div>
            </div>
            {section.count !== undefined && (
              <Badge 
                variant="secondary" 
                className="absolute top-1 sm:top-2 right-1 sm:right-2 text-xs"
              >
                {section.count}
              </Badge>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
        {/* Primary Content */}
        <div className="xl:col-span-3 order-2 xl:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'trending' && (
                <TrendingBots 
                  variant={viewMode} 
                  maxItems={12}
                  showHeader={false}
                />
              )}
              
              {activeSection === 'featured' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                      <h2 className="text-xl sm:text-2xl font-bold">Featured Bots</h2>
                    </div>
                    <Badge variant="secondary" className="w-fit">Editor's Choice</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="default" className="bg-yellow-500 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-current text-yellow-500" />
                              <span className="text-sm">4.9</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm sm:text-base">Premium Bot #{i}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Advanced automation solution
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-base sm:text-lg font-bold text-primary">
                              ${(Math.random() * 100 + 50).toFixed(2)}
                            </span>
                            <Button size="sm" className="text-xs">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'new' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                      <h2 className="text-xl sm:text-2xl font-bold">New Releases</h2>
                    </div>
                    <Badge variant="secondary" className="w-fit">This Week</Badge>
                  </div>
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <Rocket className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">New releases coming soon...</p>
                  </div>
                </div>
              )}
              
              {activeSection === 'popular' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                      <h2 className="text-xl sm:text-2xl font-bold">Most Popular</h2>
                    </div>
                    <Badge variant="secondary" className="w-fit">All Time</Badge>
                  </div>
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Popular bots loading...</p>
                  </div>
                </div>
              )}
              
              {activeSection === 'categories' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Grid3X3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    <h2 className="text-xl sm:text-2xl font-bold">Categories</h2>
                  </div>
                  {stats?.topCategories && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      {stats.topCategories.map((category, index) => (
                        <motion.div
                          key={category.name}
                          className="p-3 sm:p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{category.name}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {category.count} bots
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6 order-1 xl:order-2">
          {/* Live Activity */}
          <div className="block">
            <LiveActivityFeed maxItems={8} />
          </div>
          
          {/* Quick Stats */}
          <Card className="p-3 sm:p-4">
            <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="w-4 h-4" />
              Quick Stats
            </h3>
            {stats && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Revenue Today</span>
                  <span className="font-semibold text-green-500 text-xs sm:text-sm">
                    ${stats.revenueToday.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Avg Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current text-yellow-500" />
                    <span className="font-semibold text-xs sm:text-sm">{stats.averageRating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Sales Today</span>
                  <span className="font-semibold text-blue-500 text-xs sm:text-sm">
                    {stats.salesToday}
                  </span>
                </div>
              </div>
            )}
          </Card>
          
          {/* Quick Actions */}
          <Card className="p-3 sm:p-4">
            <h3 className="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <Zap className="w-4 h-4" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link href="/developer/upload">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                  <Bot className="w-4 h-4 mr-2" />
                  Upload Bot
                </Button>
              </Link>
              <Link href="/compare">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                  <Target className="w-4 h-4 mr-2" />
                  Compare Bots
                </Button>
              </Link>
              <Link href="/collections">
                <Button variant="outline" className="w-full justify-start text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  My Collections
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}