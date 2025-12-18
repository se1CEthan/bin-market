import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Filter, SlidersHorizontal, X, Search, Star, Download, Eye, Calendar } from 'lucide-react';
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
  const [supportedOS, setSupportedOS] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Browse Bots'}
          </h1>
          <p className="text-muted-foreground">
            Discover automation bots to streamline your workflow
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  Clear
                </Button>
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
            </Card>
          </aside>

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
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {bots ? `${bots.length} bots found` : 'Loading...'}
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48" data-testid="select-sort">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="downloads">Most Downloads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bot Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-video w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : bots && bots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No bots found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
