import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Download,
  DollarSign,
  Calendar,
  Tag,
  Settings,
  BarChart3,
} from 'lucide-react';

interface Bot {
  id: string;
  title: string;
  description: string;
  price: string;
  status: 'pending' | 'approved' | 'rejected';
  isFeatured: boolean;
  viewCount: number;
  downloadCount: number;
  averageRating: string;
  reviewCount: number;
  createdAt: string;
  category: { name: string };
}

export function BotManagement() {
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: bots, isLoading } = useQuery<Bot[]>({
    queryKey: ['/api/developer/bots'],
  });

  const updateBotMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Bot> }) => {
      const response = await fetch(`/api/developer/bots/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) throw new Error('Failed to update bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/bots'] });
      toast({ title: 'Bot updated successfully' });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to update bot', variant: 'destructive' });
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (botId: string) => {
      const response = await fetch(`/api/developer/bots/${botId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete bot');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/bots'] });
      toast({ title: 'Bot deleted successfully' });
      setDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to delete bot', variant: 'destructive' });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (data: { id: string; featured: boolean }) => {
      const response = await fetch(`/api/developer/bots/${data.id}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: data.featured }),
      });
      if (!response.ok) throw new Error('Failed to update featured status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/bots'] });
      toast({ title: 'Featured status updated' });
    },
  });

  if (isLoading) {
    return <div>Loading bots...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bot Management</h2>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Bulk Actions
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Your Bots</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bots?.map((bot) => (
                    <TableRow key={bot.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bot.title}</div>
                          <div className="text-sm text-muted-foreground">{bot.category.name}</div>
                          {bot.isFeatured && (
                            <Badge variant="secondary" className="mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            bot.status === 'approved'
                              ? 'default'
                              : bot.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {bot.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">${bot.price}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Eye className="h-3 w-3 mr-1" />
                            {bot.viewCount} views
                          </div>
                          <div className="flex items-center text-sm">
                            <Download className="h-3 w-3 mr-1" />
                            {bot.downloadCount} downloads
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span>{bot.averageRating}</span>
                          <span className="text-sm text-muted-foreground ml-1">
                            ({bot.reviewCount})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBot(bot);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              toggleFeaturedMutation.mutate({
                                id: bot.id,
                                featured: !bot.isFeatured,
                              })
                            }
                          >
                            {bot.isFeatured ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBot(bot);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bots?.map((bot) => (
              <Card key={bot.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{bot.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Views</span>
                    <span className="font-mono">{bot.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Downloads</span>
                    <span className="font-mono">{bot.downloadCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion</span>
                    <span className="font-mono">
                      {bot.viewCount > 0
                        ? ((bot.downloadCount / bot.viewCount) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-mono">{bot.averageRating}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="h-3 w-3 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Bot Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-approve reviews</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve reviews with 4+ stars
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new purchases and reviews
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed analytics and user behavior tracking
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Bot Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription>
              Update your bot's information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedBot && (
            <BotEditForm
              bot={selectedBot}
              onSave={(updates) => {
                updateBotMutation.mutate({ id: selectedBot.id, updates });
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Bot Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBot?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedBot && deleteBotMutation.mutate(selectedBot.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BotEditForm({
  bot,
  onSave,
  onCancel,
}: {
  bot: Bot;
  onSave: (updates: Partial<Bot>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(bot.title);
  const [description, setDescription] = useState(bot.description);
  const [price, setPrice] = useState(bot.price);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() =>
            onSave({
              title,
              description,
              price,
            })
          }
        >
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
}