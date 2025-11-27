import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Check, 
  X, 
  Star, 
  Download, 
  DollarSign,
  Search,
  Plus,
  Trash2
} from 'lucide-react';
import type { Bot } from '@shared/schema';

export default function BotComparison() {
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: allBots } = useQuery<(Bot & { 
    developer: { name: string }; 
    category: { name: string } 
  })[]>({
    queryKey: ['/api/bots'],
  });

  const { data: comparisonBots } = useQuery<(Bot & {
    developer: { name: string };
    category: { name: string };
  })[]>({
    queryKey: ['/api/bots/compare', selectedBots],
    enabled: selectedBots.length > 0,
    queryFn: async () => {
      if (selectedBots.length === 0) return [];
      const promises = selectedBots.map(id =>
        fetch(`/api/bots/${id}`).then(r => r.json())
      );
      return Promise.all(promises);
    },
  });

  const filteredBots = allBots?.filter(bot =>
    bot.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedBots.includes(bot.id)
  ).slice(0, 10);

  const addBot = (botId: string) => {
    if (selectedBots.length < 3 && !selectedBots.includes(botId)) {
      setSelectedBots([...selectedBots, botId]);
      setSearchQuery('');
    }
  };

  const removeBot = (botId: string) => {
    setSelectedBots(selectedBots.filter(id => id !== botId));
  };

  const features = [
    'Price',
    'Category',
    'Rating',
    'Downloads',
    'Developer',
    'Supported OS',
    'Requirements',
    'Features'
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Compare Bots
          </h1>
          <p className="text-muted-foreground">
            Compare up to 3 bots side-by-side to find the perfect one for your needs
          </p>
        </div>

        {/* Bot Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Bots to Compare ({selectedBots.length}/3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for bots to compare..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchQuery && filteredBots && filteredBots.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredBots.map(bot => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => addBot(bot.id)}
                  >
                    <div className="flex items-center gap-3">
                      {bot.thumbnailUrl && (
                        <img
                          src={bot.thumbnailUrl}
                          alt={bot.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{bot.title}</p>
                        <p className="text-sm text-muted-foreground">${bot.price}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedBots.length === 0 && !searchQuery && (
              <p className="text-center text-muted-foreground py-8">
                Search and select bots to start comparing
              </p>
            )}
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {comparisonBots && comparisonBots.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-semibold w-48">Feature</th>
                  {comparisonBots.map(bot => (
                    <th key={bot.id} className="p-4 text-center min-w-[250px]">
                      <Card>
                        <CardContent className="p-4">
                          {bot.thumbnailUrl && (
                            <img
                              src={bot.thumbnailUrl}
                              alt={bot.title}
                              className="w-full h-32 object-cover rounded mb-3"
                            />
                          )}
                          <h3 className="font-semibold mb-2">{bot.title}</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBot(bot.id)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </CardContent>
                      </Card>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Price
                  </td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4 text-center">
                      <span className="font-mono text-2xl font-bold text-primary">
                        ${bot.price}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">Category</td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4 text-center">
                      <Badge>{bot.category.name}</Badge>
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">
                    <Star className="h-4 w-4 inline mr-2" />
                    Rating
                  </td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold">{bot.averageRating || '0.00'}</span>
                        <span className="text-muted-foreground text-sm">
                          ({bot.reviewCount})
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Downloads */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">
                    <Download className="h-4 w-4 inline mr-2" />
                    Downloads
                  </td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4 text-center font-semibold">
                      {bot.downloadCount}
                    </td>
                  ))}
                </tr>

                {/* Developer */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">Developer</td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4 text-center">
                      {bot.developer.name}
                    </td>
                  ))}
                </tr>

                {/* Supported OS */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">Supported OS</td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4 text-center">
                      {bot.supportedOS && bot.supportedOS.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {bot.supportedOS.map((os, idx) => (
                            <Badge key={idx} variant="outline">{os}</Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Features */}
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">Features</td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4">
                      {bot.features && bot.features.length > 0 ? (
                        <ul className="space-y-1 text-sm">
                          {bot.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-muted-foreground text-sm">No features listed</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Action Buttons */}
                <tr>
                  <td className="p-4 font-medium">Action</td>
                  {comparisonBots.map(bot => (
                    <td key={bot.id} className="p-4 text-center">
                      <Button asChild className="w-full">
                        <Link href={`/bot/${bot.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
