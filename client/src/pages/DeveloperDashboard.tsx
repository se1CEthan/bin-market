import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Bot, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star,
  Package,
  Settings,
  BarChart3,
  FileText,
  Download,
  Eye,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CryptoSettings } from '@/components/CryptoSettings';
// ...existing code...

interface DeveloperStats {
  totalBots: number;
  activeBots: number;
  totalSales: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalDownloads: number;
  averageRating: number;
  totalReviews: number;
  pendingPayouts: number;
  availableBalance: number;
}

interface Bot {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'pending' | 'rejected' | 'draft';
  downloads: number;
  rating: number;
  reviews: number;
  revenue: number;
  createdAt: string;
  updatedAt: string;
}

const DeveloperDashboard: React.FC = () => {
  // Safe formatter for numeric values coming from API (may be strings)
  const fmt = (v: unknown, decimals = 2) => {
    const n = typeof v === 'number' ? v : (v == null ? NaN : Number(v));
    if (Number.isFinite(n)) return n.toFixed(decimals);
    if (decimals === 0) return '0';
    if (decimals === 1) return '0.0';
    return '0.00';
  };
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Fetch developer stats
  const { data: stats, isLoading: statsLoading } = useQuery<DeveloperStats>({
    queryKey: ['developer-stats'],
    queryFn: async () => {
      const response = await fetch('/api/developer/stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Fetch payout history
  const { data: payouts, isLoading: payoutsLoading, refetch: refetchPayouts } = useQuery({
    queryKey: ['developer-payouts'],
    queryFn: async () => {
      const res = await fetch('/api/developer/payouts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch payouts');
      return res.json();
    }
  });

  const retryPayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const res = await fetch(`/api/developer/payouts/${payoutId}/retry`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retry payout');
      return data;
    },
    onSuccess: () => {
      toast.success('Payout retried — check status shortly');
      refetchPayouts();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Retry failed');
    }
  });

  // Fetch developer bots
  const { data: bots, isLoading: botsLoading } = useQuery<Bot[]>({
    queryKey: ['developer-bots'],
    queryFn: async () => {
      const response = await fetch('/api/developer/bots', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch bots');
      return response.json();
    }
  });

  // Become developer mutation
  const becomeDeveloperMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/developer/register', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to become developer');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Welcome to the developer program!');
    },
    onError: () => {
      toast.error('Failed to register as developer');
    }
  });

  // If user is not a developer yet, show registration
  if (user && !user.isDeveloper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Start Selling Your Bots</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of developers earning money by selling automation bots on BIN Marketplace
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">90% Revenue Share</h3>
                  <p className="text-sm text-muted-foreground">Keep 90% of every sale</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Instant Payouts</h3>
                  <p className="text-sm text-muted-foreground">Get paid via crypto automatically</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Global Reach</h3>
                  <p className="text-sm text-muted-foreground">Sell to users worldwide</p>
                </CardContent>
              </Card>
            </div>

            <Button
              size="lg"
              onClick={() => becomeDeveloperMutation.mutate()}
              disabled={becomeDeveloperMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {becomeDeveloperMutation.isPending ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Setting up your account...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5 mr-2" />
                  Become a Developer
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Developer Dashboard</h1>
              <p className="text-muted-foreground">Manage your bots and track your earnings</p>
            </div>
            <Button
              onClick={() => setSelectedTab('upload')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload New Bot
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${fmt(stats?.totalRevenue, 2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Bots</p>
                  <p className="text-2xl font-bold">{stats?.activeBots || 0}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{stats?.totalSales || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{fmt(stats?.averageRating, 1)}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bots">My Bots</TabsTrigger>
              <TabsTrigger value="upload">Upload Bot</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest bot performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {bots?.slice(0, 3).map((bot) => (
                        <div key={bot.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{bot.name}</p>
                            <p className="text-sm text-muted-foreground">{bot.downloads} downloads</p>
                          </div>
                          <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                            {bot.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common developer tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Bot
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Request Payout
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Developer Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bots" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Bots</CardTitle>
                  <CardDescription>Manage your uploaded bots</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {botsLoading ? (
                      <div className="text-center py-8">Loading your bots...</div>
                    ) : bots?.length === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No bots uploaded yet</p>
                        <Button 
                          className="mt-4"
                          onClick={() => setSelectedTab('upload')}
                        >
                          Upload Your First Bot
                        </Button>
                      </div>
                    ) : (
                      bots?.map((bot) => (
                        <div key={bot.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">{bot.name}</h3>
                                <Badge variant={
                                  bot.status === 'active' ? 'default' :
                                  bot.status === 'pending' ? 'secondary' :
                                  bot.status === 'rejected' ? 'destructive' : 'outline'
                                }>
                                  {bot.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{bot.description}</p>
                              <div className="flex items-center gap-6 text-sm">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  ${bot.price}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Download className="w-4 h-4" />
                                  {bot.downloads}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-4 h-4" />
                                  {fmt(bot.rating, 1)} ({bot.reviews})
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  ${fmt(bot.revenue, 2)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <BotUploadForm />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Track your bot performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      {bots?.map((b) => (
                        <Button key={b.id} variant={"outline"} onClick={async () => {
                          try {
                            const res = await fetch(`/api/developer/analytics/${b.id}`, { credentials: 'include' });
                            if (!res.ok) throw new Error('Failed to load analytics');
                            const data = await res.json();
                            // display simple modal or toast with summary
                            toast.success(`Views: ${data.views}, Downloads: ${data.downloads}, Revenue: $${data.revenue}`);
                          } catch (err: any) {
                            toast.error(err?.message || 'Analytics load failed');
                          }
                        }}>{b.name}</Button>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Click a bot to view its analytics summary.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Overview</CardTitle>
                    <CardDescription>Your revenue breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Available Balance</span>
                      <span className="font-bold text-green-600">${fmt(stats?.availableBalance, 2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pending Payouts</span>
                      <span className="font-bold text-yellow-600">${fmt(stats?.pendingPayouts, 2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Earned</span>
                      <span className="font-bold">${fmt(stats?.totalRevenue, 2)}</span>
                    </div>
                    <RequestPayoutButton />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payout Settings</CardTitle>
                    <CardDescription>Configure your payment preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <CryptoSettings />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>Recent automatic payouts and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  {payoutsLoading ? (
                    <div className="text-center py-8">Loading payouts...</div>
                  ) : !payouts || payouts.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">No payouts yet</div>
                  ) : (
                    <div className="space-y-3">
                      {payouts.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="text-sm font-medium">${Number(p.amount).toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-muted-foreground">{p.cryptoWallet}</div>
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded text-xs ${p.status === 'paid' ? 'bg-green-100 text-green-800' : p.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {p.status}
                            </div>
                            {(p.status === 'failed' || p.status === 'pending') && (
                              <Button size="sm" onClick={() => retryPayoutMutation.mutate(p.id)} disabled={retryPayoutMutation.isLoading}>
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

// Bot Upload Form Component
const BotUploadForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    tags: '',
    file: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', formData.name);
      fd.append('description', formData.description);
      fd.append('price', formData.price || '0');
      fd.append('categoryId', formData.category || '');
      if (formData.file) fd.append('botFile', formData.file);

      const res = await fetch('/api/bots/upload', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      toast.success('Bot uploaded successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Bot</CardTitle>
        <CardDescription>Share your automation bot with the community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Bot Name</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter bot name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price ($)</label>
              <input
                type="number"
                step="0.01"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border rounded-md"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe what your bot does..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select category</option>
                <option value="ai-machine-learning">AI & Machine Learning</option>
                <option value="social-media">Social Media</option>
                <option value="business-productivity">Business & Productivity</option>
                <option value="ecommerce">E-commerce</option>
                <option value="data-scraping">Data Scraping</option>
                <option value="marketing-seo">Marketing & SEO</option>
                <option value="gaming">Gaming</option>
                <option value="finance-trading">Finance & Trading</option>
                <option value="communication">Communication</option>
                <option value="development-tools">Development Tools</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="automation, python, api"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Bot File</label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Drop your bot file here or click to browse</p>
              <input
                type="file"
                className="hidden"
                accept=".zip,.py,.js,.exe"
                onChange={(e) => setFormData({...formData, file: e.target.files?.[0] || null})}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload Bot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const RequestPayoutButton: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: stats } = useQuery({ queryKey: ['developer-stats'], queryFn: async () => { const res = await fetch('/api/developer/stats', { credentials: 'include' }); return res.json(); } });
  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await fetch('/api/developer/payouts/request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request payout');
      return data;
    },
    onSuccess: () => {
      toast.success('Payout requested');
      queryClient.invalidateQueries({ queryKey: ['developer-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['developer-stats'] });
    },
    onError: (err: any) => toast.error(err?.message || 'Payout request failed')
  });

  const handleRequest = () => {
    const suggested = stats?.availableBalance || '0.00';
    const amount = window.prompt('Enter payout amount', suggested);
    if (!amount) return;
    mutation.mutate(amount);
  };

  return (
    <Button className="w-full mt-4" onClick={handleRequest} disabled={mutation.isLoading}>
      <DollarSign className="w-4 h-4 mr-2" />
      {mutation.isLoading ? 'Requesting...' : 'Request Payout'}
    </Button>
  );
};

export default DeveloperDashboard;