import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users, Bot, DollarSign, CheckCircle2, XCircle, Eye, BarChart2, PieChart } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';
import { ChartContainer } from '@/components/ui/chart';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();


  // Enhanced analytics for admin
  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/bots-analytics'],
  });
  const bots = analytics?.bots || [];
  const transactions = analytics?.transactions || [];

  // Calculate stats
  const totalBots = bots.length;
  const totalSold = transactions.length;
  const totalBought = transactions.length; // same as sold for marketplace
  const botTypes = Array.from(new Set(bots.map((b: any) => b.type || b.categoryId)));
  const botsByType = botTypes.map(type => ({
    type,
    count: bots.filter((b: any) => (b.type || b.categoryId) === type).length
  }));
  const botsByUser = bots.reduce((acc: any, bot: any) => {
    acc[bot.developerId] = (acc[bot.developerId] || 0) + 1;
    return acc;
  }, {});
  const salesByBot = bots.map((bot: any) => ({
    title: bot.title,
    count: transactions.filter((t: any) => t.botId === bot.id).length
  }));
  const salesByDate = transactions.reduce((acc: any, t: any) => {
    const date = new Date(t.createdAt).toISOString().slice(0, 10);
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const salesByDateArr = Object.entries(salesByDate).map(([date, count]) => ({ date, count }));

  const approveMutation = useMutation({
    mutationFn: async ({ botId, status }: { botId: string; status: 'approved' | 'rejected' }) => {
      return await apiRequest('POST', `/api/admin/bots/${botId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-bots'] });
      toast({
        title: 'Bot Status Updated',
        description: 'The bot status has been updated successfully.',
      });
    },
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="p-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl font-bold mb-4">Admin Access Required</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage platform, users, and content</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Animation styles */}
          <style>{`
            .admin-animate {
              opacity: 0;
              transform: translateY(20px);
              animation: fadeInUp 0.7s cubic-bezier(.4,0,.2,1) forwards;
            }
            @keyframes fadeInUp {
              to {
                opacity: 1;
                transform: none;
              }
            }
            .admin-card:hover {
              box-shadow: 0 8px 32px rgba(99,102,241,0.12), 0 1.5px 6px rgba(16,185,129,0.08);
              transform: scale(1.03);
              transition: box-shadow 0.3s, transform 0.3s;
            }
          `}</style>
          <Card className="admin-animate admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Bots</p>
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold">{totalBots}</p>
            </CardContent>
          </Card>
          <Card className="admin-animate admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Sold</p>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold">{totalSold}</p>
            </CardContent>
          </Card>
          <Card className="admin-animate admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Bought</p>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold">{totalBought}</p>
            </CardContent>
          </Card>
          <Card className="admin-animate admin-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Bot Types</p>
                <PieChart className="h-5 w-5 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold">{botTypes.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="admin-animate admin-card">
            <CardHeader>
              <CardTitle>Sales by Date</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ sales: { color: '#6366f1' } }}>
                {({ ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid }) => (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={salesByDateArr}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="admin-animate admin-card">
            <CardHeader>
              <CardTitle>Bots by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ bots: { color: '#10b981' } }}>
                {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend }) => (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={botsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} fill="#10b981">
                        {botsByType.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={['#10b981', '#6366f1', '#f59e42', '#ef4444', '#3b82f6'][idx % 5]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="mb-8">
          <Card className="admin-animate admin-card">
            <CardHeader>
              <CardTitle>Bot Uploads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Developer</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bots.map((bot: any) => (
                    <TableRow key={bot.id}>
                      <TableCell>{bot.title}</TableCell>
                      <TableCell>{bot.type || bot.categoryId}</TableCell>
                      <TableCell>{bot.developerId}</TableCell>
                      <TableCell>{new Date(bot.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="mb-8">
          <Card className="admin-animate admin-card">
            <CardHeader>
              <CardTitle>Bot Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t: any) => (
                    <TableRow key={t.id}>
                      <TableCell>{bots.find((b: any) => b.id === t.botId)?.title || t.botId}</TableCell>
                      <TableCell>{t.buyerId}</TableCell>
                      <TableCell>${t.amount}</TableCell>
                      <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="bots" data-testid="tab-all-bots">All Bots</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Bot Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingBots && pendingBots.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bot</TableHead>
                        <TableHead>Developer</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingBots.map((bot: any) => (
                        <TableRow key={bot.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {bot.thumbnailUrl && (
                                <img src={bot.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover" />
                              )}
                              <div>
                                <p className="font-medium">{bot.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{bot.description}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{bot.developer?.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{bot.category?.name}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">${bot.price}</TableCell>
                          <TableCell>{new Date(bot.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                data-testid={`button-view-${bot.id}`}
                              >
                                <Link href={`/bot/${bot.id}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => approveMutation.mutate({ botId: bot.id, status: 'approved' })}
                                disabled={approveMutation.isPending}
                                data-testid={`button-approve-${bot.id}`}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => approveMutation.mutate({ botId: bot.id, status: 'rejected' })}
                                disabled={approveMutation.isPending}
                                data-testid={`button-reject-${bot.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No pending approvals
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bots">
            <Card>
              <CardHeader>
                <CardTitle>All Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground">
                  All bots management coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground">
                  User management coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
