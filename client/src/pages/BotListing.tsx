import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BotCard } from '@/components/BotCard';
import { BotGridSkeleton } from '@/components/ui/advanced-skeleton';
import { AdvancedCard } from '@/components/ui/advanced-card';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { 
  pageTransition, 
  staggerContainer, 
  staggerItem, 
  fadeInUp,
  slideInFromRight 
} from '@/lib/animations';
import { Filter, SlidersHorizontal, X, Search, Star, Download, Calendar, Grid3X3, List, Sparkles, TrendingUp, Verified, Shield, Clock } from 'lucide-react';
import type { Bot, Category } from '@shared/schema';

export default function BotListing() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const initialSearchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categoryFilter ? [categoryFilter] : []);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Build query string
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append('search', searchQuery);
  if (selectedCategories[0]) queryParams.append('category', selectedCategories[0]);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (priceRange[0] > 0) queryParams.append('minPrice', priceRange[0].toString());
  if (priceRange[1] < 1000) queryParams.append('maxPrice', priceRange[1].toString());
  
  const queryString = queryParams.toString();
  const apiUrl = `/api/bots${queryString ? `?${queryString}` : ''}`;

  const { data: bots, isLoading } = useQuery<(Bot & { developer: { name: string; avatarUrl: string | null }; category: { name: string } })[]>({
    queryKey: [apiUrl],
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setMinRating(0);
    setVerifiedOnly(false);
    setSearchQuery('');
  };

  return (
    <motion.div 
      className="min-h-screen py-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Enhanced Header with Search */}
        <motion.div 
          className="mb-8 space-y-6"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <div className="text-center space-y-4">
            <motion.h1 
              className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {debouncedSearch ? `Search results for "${debouncedSearch}"` : 'Production-Ready Automation Bots'}
            </motion.h1>
            <motion.p 
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Discover verified, production-ready automation bots from trusted developers. 
              All bots include documentation, support, and instant delivery.
            </motion.p>
          </div>

          {/* Enhanced Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search bots, categories, or developers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg bg-background/50 backdrop-blur border-primary/20 focus:border-primary/50"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex items-center justify-center gap-8 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>All Bots Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Verified className="w-4 h-4 text-purple-500" />
              <span>Trusted Developers</span>
            </div>
          </motion.div>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <motion.aside 
            className="hidden lg:block w-64 flex-shrink-0"
            variants={slideInFromRight}
            initial="initial"
            animate="animate"
          >
            <Card className="p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </h3>
                <InteractiveButton
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                  ripple
                >
                  Clear
                </InteractiveButton>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Category</Label>
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                      data-testid={`checkbox-category-${category.id}`}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {category.name}
                    </Label>
                    <span className="text-xs text-muted-foreground">{category.botCount}</span>
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Price Range</Label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                    data-testid="slider-price-range"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="font-mono">${priceRange[0]}</span>
                    <span className="font-mono">${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Minimum Rating</Label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[minRating]}
                    onValueChange={(value) => setMinRating(value[0])}
                    className="w-full"
                  />
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    <span className="font-mono">{minRating.toFixed(1)}+</span>
                  </div>
                </div>
              </div>

              {/* Verified Only */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="verified-only"
                  checked={verifiedOnly}
                  onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                />
                <Label htmlFor="verified-only" className="text-sm cursor-pointer flex items-center gap-2">
                  <Verified className="w-4 h-4 text-blue-500" />
                  Verified developers only
                </Label>
              </div>
            </Card>
          </motion.aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden fixed bottom-4 right-4 z-50">
            <Button
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full shadow-lg"
              data-testid="button-toggle-filters-mobile"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <Card className="absolute inset-x-4 top-4 bottom-4 p-6 overflow-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                    data-testid="button-close-filters"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Categories */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Category</Label>
                    {categories?.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`mobile-category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label
                          htmlFor={`mobile-category-${category.id}`}
                          className="text-sm cursor-pointer flex-1"
                        >
                          {category.name}
                        </Label>
                        <span className="text-xs text-muted-foreground">{category.botCount}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Price Range</Label>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={1000}
                        step={10}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="font-mono">${priceRange[0]}</span>
                        <span className="font-mono">${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Minimum Rating</Label>
                    <div className="space-y-2">
                      <Slider
                        min={0}
                        max={5}
                        step={0.5}
                        value={[minRating]}
                        onValueChange={(value) => setMinRating(value[0])}
                        className="w-full"
                      />
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-current text-yellow-500" />
                        <span className="font-mono">{minRating.toFixed(1)}+</span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Only */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="mobile-verified-only"
                      checked={verifiedOnly}
                      onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
                    />
                    <Label htmlFor="mobile-verified-only" className="text-sm cursor-pointer flex items-center gap-2">
                      <Verified className="w-4 h-4 text-blue-500" />
                      Verified developers only
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    Clear All
                  </Button>
                  <Button onClick={() => setShowFilters(false)} className="flex-1">
                    Apply Filters
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Sort Controls */}
            <motion.div 
              className="flex items-center justify-between mb-6"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <div className="flex items-center gap-4">
                <motion.p 
                  className="text-sm text-muted-foreground"
                  animate={{ opacity: bots ? 1 : 0.5 }}
                >
                  {bots ? (
                    <span className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {bots.length}
                      </Badge>
                      bots found
                    </span>
                  ) : (
                    'Loading...'
                  )}
                </motion.p>
                
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <InteractiveButton
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </InteractiveButton>
                  <InteractiveButton
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </InteractiveButton>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trending">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Trending
                      </div>
                    </SelectItem>
                    <SelectItem value="newest">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Newest
                      </div>
                    </SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Highest Rated
                      </div>
                    </SelectItem>
                    <SelectItem value="downloads">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Most Downloads
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Bot Grid */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <BotGridSkeleton count={6} />
                </motion.div>
              ) : bots && bots.length > 0 ? (
                <motion.div
                  key="bots"
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                    : "space-y-4"
                  }
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {bots.map((bot, index) => (
                    <motion.div
                      key={bot.id}
                      variants={staggerItem}
                      custom={index}
                      layout
                    >
                      <BotCard bot={bot} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="p-12 text-center">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Filter className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    </motion.div>
                    <h3 className="font-semibold text-xl mb-2">No bots found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Try adjusting your filters or search query to discover amazing automation bots
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Clear Filters
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
