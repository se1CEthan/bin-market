import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Tag,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'bot' | 'category' | 'tag' | 'developer';
  count?: number;
  trending?: boolean;
}

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'category' | 'price' | 'rating' | 'os' | 'feature';
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  placeholder?: string;
  className?: string;
}

export function AdvancedSearch({ onSearch, placeholder = "Search bots...", className }: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { user } = useAuth();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const { data: suggestions } = useQuery<SearchSuggestion[]>({
    queryKey: ['/api/search/suggestions', query],
    enabled: query.length > 1,
  });

  const { data: trendingSearches } = useQuery<string[]>({
    queryKey: ['/api/search/trending'],
  });

  const { data: recommendations } = useQuery<SearchSuggestion[]>({
    queryKey: ['/api/search/recommendations', user?.id],
    enabled: !!user,
  });

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      saveSearch(searchQuery);
      onSearch(searchQuery, activeFilters);
      setIsOpen(false);
    }
  };

  const addFilter = (filter: SearchFilter) => {
    if (!activeFilters.find(f => f.id === filter.id)) {
      const updated = [...activeFilters, filter];
      setActiveFilters(updated);
      onSearch(query, updated);
    }
  };

  const removeFilter = (filterId: string) => {
    const updated = activeFilters.filter(f => f.id !== filterId);
    setActiveFilters(updated);
    onSearch(query, updated);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    onSearch(query, []);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'bot':
        return <Search className="h-4 w-4" />;
      case 'category':
        return <Tag className="h-4 w-4" />;
      case 'developer':
        return <Star className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder={placeholder}
              className="pl-10 pr-4"
              onFocus={() => setIsOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search bots, categories, developers..."
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>

              {/* AI Recommendations */}
              {recommendations && recommendations.length > 0 && (
                <CommandGroup heading="Recommended for you">
                  {recommendations.slice(0, 3).map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        setQuery(item.text);
                        handleSearch(item.text);
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                      <span>{item.text}</span>
                      <Badge variant="secondary" className="ml-auto">
                        AI
                      </Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Search Suggestions */}
              {suggestions && suggestions.length > 0 && (
                <CommandGroup heading="Suggestions">
                  {suggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      onSelect={() => {
                        setQuery(suggestion.text);
                        handleSearch(suggestion.text);
                      }}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <span className="ml-2">{suggestion.text}</span>
                      {suggestion.trending && (
                        <TrendingUp className="h-3 w-3 ml-auto text-orange-500" />
                      )}
                      {suggestion.count && (
                        <Badge variant="outline" className="ml-auto">
                          {suggestion.count}
                        </Badge>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Trending Searches */}
              {trendingSearches && trendingSearches.length > 0 && (
                <CommandGroup heading="Trending">
                  {trendingSearches.slice(0, 5).map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-2 text-orange-500" />
                      <span>{search}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <CommandGroup heading="Recent searches">
                  {recentSearches.map((search, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{search}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Quick Filters */}
              <CommandGroup heading="Quick filters">
                <CommandItem onSelect={() => addFilter({ id: 'free', label: 'Free', value: '0', type: 'price' })}>
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Free bots</span>
                </CommandItem>
                <CommandItem onSelect={() => addFilter({ id: 'premium', label: 'Premium', value: '50+', type: 'price' })}>
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Premium bots ($50+)</span>
                </CommandItem>
                <CommandItem onSelect={() => addFilter({ id: 'highly-rated', label: 'Highly Rated', value: '4+', type: 'rating' })}>
                  <Star className="h-4 w-4 mr-2" />
                  <span>Highly rated (4+ stars)</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => removeFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

// Smart search suggestions component
export function SearchSuggestions({ query }: { query: string }) {
  const { data: smartSuggestions } = useQuery({
    queryKey: ['/api/search/smart-suggestions', query],
    enabled: query.length > 2,
  });

  if (!smartSuggestions || smartSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium">You might also like</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {smartSuggestions.map((suggestion: any, index: number) => (
            <Badge key={index} variant="outline" className="cursor-pointer hover:bg-muted">
              {suggestion.text}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}