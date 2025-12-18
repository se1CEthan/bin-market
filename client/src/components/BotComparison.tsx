import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  GitCompare,
  Plus,
  X,
  Star,
  Download,
  Eye,
  DollarSign,
  Calendar,
  User,
  Tag,
  CheckCircle,
  XCircle,
  Minus,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';

interface Bot {
  id: string;
  title: string;
  description: string;
  price: string;
  thumbnailUrl?: string;
  averageRating: string;
  reviewCount: number;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  features: string[];
  supportedOS: string[];
  requirements: string;
  category: { name: string };
  developer: { name: string; avatarUrl?: string };
  fileSize?: string;
  lastUpdated?: string;
  version?: string;
  compatibility: string[];
  securityFeatures: string[];
  performanceMetrics: {
    speed: number;
    reliability: number;
    efficiency: number;
  };
}

interface ComparisonProps {
  initialBots?: Bot[];
}

export function BotComparison({ initialBots = [] }: ComparisonProps) {
  const [selectedBots, setSelectedBots] = useState<Bot[]>(initialBots);
  const [searchQuery, setSearchQuery] = useState('');
  const [addBotOpen, setAddBotOpen] = useState(false);

  const { data: availableBots } = useQuery<Bot[]>({
    queryKey: ['/api/bots', { search: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  const addBot = (bot: Bot) => {
    if (selectedBots.length < 4 && !selectedBots.find(b => b.id === bot.id)) {
      setSelectedBots([...selectedBots, bot]);
      setAddBotOpen(false);
      setSearchQuery('');
    }
  };

  const removeBot = (botId: string) => {
    setSelectedBots(selectedBots.filter(bot => bot.id !== botId));
  };

  const getComparisonScore = (bot: Bot) => {
    const rating = parseFloat(bot.averageRating || '0');
    const downloads = bot.downloadCount;
    const reviews = bot.reviewCount;
    
    // Calculate a composite score
    const ratingScore = (rating / 5) * 40;
    const popularityScore = Math.min((downloads / 1000) * 30, 30);
    const trustScore = Math.min((reviews / 100) * 30, 30);
    
    return Math.round(ratingScore + popularityScore + trustScore);
  };

  const getFeatureComparison = () => {
    if (selectedBots.length === 0) return [];
    
    const allFeatures = new Set<string>();
    selectedBots.forEach(bot => {
      bot.features.forEach(feature => allFeatures.add(feature));
    });
    
    return Array.from(allFeatures).map(feature => ({
      feature,
      bots: selectedBots.map(bot => ({
        id: bot.id,
        hasFeature: bot.features.includes(feature),
      })),
    }));
  };

  const getPriceComparison = () => {
    const prices = selectedBots.map(bot => parseFloat(bot.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    return selectedBots.map(bot => {
      const price = parseFloat(bot.price);
      let indicator = 'neutral';
      
      if (price === minPrice && prices.length > 1) indicator = 'best';
      else if (price === maxPrice && prices.length > 1) indicator = 'highest';
      
      return {
        id: bot.id,
        price,
        indicator,
      };
    });
  };

  const getPerformanceComparison = () => {
    return selectedBots.map(bot => ({
      id: bot.id,
      overall: Math.round((bot.performanceMetrics.speed + bot.performanceMetrics.reliability + bot.performanceMetrics.efficiency) / 3),
      ...bot.performanceMetrics,
    }));
  };

  const featureComparison = getFeatureComparison();
  const priceComparison = getPriceComparison();
  const performanceComparison = getPerformanceComparison();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6" />
            Bot Comparison
          </h2>
          <p className="text-muted-foreground">
            Compare up to 4 bots side by side to make the best choice
          </p>
        </div>
        <Dialog open={addBotOpen} onOpenChange={setAddBotOpen}>
          <DialogTrigger asChild>
            <Button disabled={selectedBots.length >= 4}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bot ({selectedBots.length}/4)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bot to Comparison</DialogTitle>
              <DialogDescription>
                Search for a bot to add to your comparison
              </DialogDescription>
            </DialogHeader>
            <Command>
              <CommandInput
                placeholder="Search bots..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>No bots found.</CommandEmpty>
                <CommandGroup>
                  {availableBots?.map((bot) => (
                    <CommandItem
                      key={bot.id}
                      onSelect={() => addBot(bot)}
                      disabled={selectedBots.find(b => b.id === bot.id) !== undefined}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {bot.thumbnailUrl && (
                          <img
                            src={bot.thumbnailUrl}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{bot.title}</div>
                          <div className="text-sm text-muted-foreground">
                            ${bot.price} • {bot.category.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{bot.averageRating}</span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
      </div>

      {selectedBots.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <GitCompare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Bots Selected</h3>
            <p className="text-muted-foreground mb-4">
              Add bots to start comparing their features, prices, and performance
            </p>
            <Button onClick={() => setAddBotOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Bot
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Bot Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedBots.map((bot) => (
              <Card key={bot.id} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeBot(bot.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    {bot.thumbnailUrl && (
                      <img
                        src={bot.thumbnailUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{bot.title}</h3>
                      <p className="text-xs text-muted-foreground">{bot.category.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg">${bot.price}</span>
                    <Badge variant="outline">
                      Score: {getComparisonScore(bot)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>{bot.averageRating} ({bot.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Downloads</span>
                      <span>{bot.downloadCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Developer</span>
                      <span className="truncate">{bot.developer.name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Feature</TableHead>
                      {selectedBots.map((bot) => (
                        <TableHead key={bot.id} className="text-center min-w-32">
                          {bot.title}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Price Comparison */}
                    <TableRow>
                      <TableCell className="font-medium">Price</TableCell>
                      {priceComparison.map((item) => (
                        <TableCell key={item.id} className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono">${item.price}</span>
                            {item.indicator === 'best' && (
                              <Badge className="bg-green-500">Best Value</Badge>
                            )}
                            {item.indicator === 'highest' && (
                              <Badge variant="outline">Highest</Badge>
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Performance Metrics */}
                    <TableRow>
                      <TableCell className="font-medium">Overall Performance</TableCell>
                      {performanceComparison.map((item) => (
                        <TableCell key={item.id} className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span>{item.overall}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${item.overall}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Speed</TableCell>
                      {performanceComparison.map((item) => (
                        <TableCell key={item.id} className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>{item.speed}%</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Reliability</TableCell>
                      {performanceComparison.map((item) => (
                        <TableCell key={item.id} className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span>{item.reliability}%</span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Supported OS */}
                    <TableRow>
                      <TableCell className="font-medium">Supported OS</TableCell>
                      {selectedBots.map((bot) => (
                        <TableCell key={bot.id} className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {bot.supportedOS.map((os) => (
                              <Badge key={os} variant="outline" className="text-xs">
                                {os}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Features Comparison */}
                    {featureComparison.map((item) => (
                      <TableRow key={item.feature}>
                        <TableCell className="font-medium">{item.feature}</TableCell>
                        {item.bots.map((botFeature) => (
                          <TableCell key={botFeature.id} className="text-center">
                            {botFeature.hasFeature ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                    {/* Additional Metrics */}
                    <TableRow>
                      <TableCell className="font-medium">Last Updated</TableCell>
                      {selectedBots.map((bot) => (
                        <TableCell key={bot.id} className="text-center">
                          {bot.lastUpdated ? new Date(bot.lastUpdated).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">File Size</TableCell>
                      {selectedBots.map((bot) => (
                        <TableCell key={bot.id} className="text-center">
                          {bot.fileSize || 'N/A'}
                        </TableCell>
                      ))}
                    </TableRow>

                    <TableRow>
                      <TableCell className="font-medium">Version</TableCell>
                      {selectedBots.map((bot) => (
                        <TableCell key={bot.id} className="text-center">
                          {bot.version || 'N/A'}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            {selectedBots.map((bot) => (
              <Button key={bot.id} className="flex-1 max-w-48">
                Buy {bot.title} - ${bot.price}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}