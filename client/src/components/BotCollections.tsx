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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BotCard } from '@/components/BotCard';
import { toast } from '@/hooks/use-toast';
import {
  FolderPlus,
  Heart,
  Star,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  Lock,
  Globe,
  Plus,
  Grid3X3,
  List,
  Filter,
  Search,
} from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
  botCount: number;
  createdAt: string;
  updatedAt: string;
  bots: any[];
  tags: string[];
  likes: number;
  isLiked: boolean;
}

interface WishlistItem {
  id: string;
  botId: string;
  bot: any;
  addedAt: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

export function BotCollections() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ['/api/collections'],
  });

  const { data: wishlist } = useQuery<WishlistItem[]>({
    queryKey: ['/api/wishlist'],
  });

  const { data: publicCollections } = useQuery<Collection[]>({
    queryKey: ['/api/collections/public'],
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; isPublic: boolean }) => {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      setCreateDialogOpen(false);
      toast({ title: 'Collection created successfully!' });
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Collection> }) => {
      const response = await fetch(`/api/collections/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      });
      if (!response.ok) throw new Error('Failed to update collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      setEditingCollection(null);
      toast({ title: 'Collection updated successfully!' });
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections'] });
      toast({ title: 'Collection deleted successfully!' });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (data: { botId: string; priority: string; notes: string }) => {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add to wishlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({ title: 'Added to wishlist!' });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove from wishlist');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      toast({ title: 'Removed from wishlist!' });
    },
  });

  const likeCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const response = await fetch(`/api/collections/${collectionId}/like`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to like collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collections/public'] });
    },
  });

  const filteredCollections = collections?.filter(collection =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    collection.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Collections & Wishlist</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
                <DialogDescription>
                  Organize your favorite bots into collections
                </DialogDescription>
              </DialogHeader>
              <CreateCollectionForm
                onSubmit={(data) => createCollectionMutation.mutate(data)}
                onCancel={() => setCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="my-collections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-collections">My Collections</TabsTrigger>
          <TabsTrigger value="wishlist">
            Wishlist
            {wishlist && wishlist.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {wishlist.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="public-collections">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my-collections">
          {isLoading ? (
            <div>Loading collections...</div>
          ) : filteredCollections && filteredCollections.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredCollections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  viewMode={viewMode}
                  onEdit={setEditingCollection}
                  onDelete={(id) => deleteCollectionMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Collections Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first collection to organize your favorite bots
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wishlist">
          {wishlist && wishlist.length > 0 ? (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.bot.title}</h3>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.bot.description}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Note: {item.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg">${item.bot.price}</span>
                        <Button size="sm">
                          Buy Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromWishlistMutation.mutate(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Your Wishlist is Empty</h3>
                <p className="text-muted-foreground">
                  Add bots to your wishlist to keep track of ones you want to buy later
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="public-collections">
          {publicCollections && publicCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicCollections.map((collection) => (
                <PublicCollectionCard
                  key={collection.id}
                  collection={collection}
                  onLike={(id) => likeCollectionMutation.mutate(id)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Public Collections</h3>
                <p className="text-muted-foreground">
                  Check back later for curated collections from the community
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Collection Dialog */}
      <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update your collection details
            </DialogDescription>
          </DialogHeader>
          {editingCollection && (
            <EditCollectionForm
              collection={editingCollection}
              onSubmit={(updates) => updateCollectionMutation.mutate({
                id: editingCollection.id,
                updates,
              })}
              onCancel={() => setEditingCollection(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CollectionCard({
  collection,
  viewMode,
  onEdit,
  onDelete,
}: {
  collection: Collection;
  viewMode: 'grid' | 'list';
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className={viewMode === 'list' ? 'flex' : ''}>
      <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {collection.isPublic ? (
              <Globe className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {collection.name}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(collection)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(collection.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className={viewMode === 'list' ? 'flex-1' : ''}>
        <p className="text-sm text-muted-foreground mb-3">
          {collection.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{collection.botCount} bots</span>
            <span>Updated {new Date(collection.updatedAt).toLocaleDateString()}</span>
          </div>
          <Button variant="outline" size="sm">
            View Collection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PublicCollectionCard({
  collection,
  onLike,
}: {
  collection: Collection;
  onLike: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {collection.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          {collection.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{collection.botCount} bots</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(collection.id)}
              className="flex items-center gap-1"
            >
              <Heart className={`h-4 w-4 ${collection.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {collection.likes}
            </Button>
          </div>
          <Button variant="outline" size="sm">
            View Collection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCollectionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { name: string; description: string; isPublic: boolean }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Collection Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Favorite Bots"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A collection of my most useful automation bots"
          rows={3}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="public">Make Public</Label>
        <Switch
          id="public"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({ name, description, isPublic })}
          disabled={!name.trim()}
        >
          Create Collection
        </Button>
      </DialogFooter>
    </div>
  );
}

function EditCollectionForm({
  collection,
  onSubmit,
  onCancel,
}: {
  collection: Collection;
  onSubmit: (updates: Partial<Collection>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);
  const [isPublic, setIsPublic] = useState(collection.isPublic);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Collection Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="public">Make Public</Label>
        <Switch
          id="public"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => onSubmit({ name, description, isPublic })}
          disabled={!name.trim()}
        >
          Update Collection
        </Button>
      </DialogFooter>
    </div>
  );
}