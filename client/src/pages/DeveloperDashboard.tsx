import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { PayPalSettings } from '@/components/PayPalSettings';
import { 
  DollarSign, 
  TrendingUp, 
  Bot, 
  Star, 
  Upload,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DeveloperDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalSales: string;
    totalEarnings: string;
    activeBots: number;
    averageRating: string;
  }>({
    queryKey: ['/api/developer/stats'],
  });

  const { data: bots } = useQuery({
    queryKey: ['/api/developer/bots'],
  });

  const { data: salesData } = useQuery<Array<{ date: string; sales: number; earnings: number }>>({
    queryKey: ['/api/developer/sales'],
  });

  const { data: recentSales } = useQuery({
    queryKey: ['/api/developer/recent-sales'],
  });

  const { data: payoutRequests } = useQuery({
    queryKey: ['/api/developer/payouts'],
  });

  if (!user?.isDeveloper) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 md:px-6">
          <Card className="p-12 text-center">
            <h2 className="font-display text-2xl font-bold mb-4">Developer Access Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to become a developer to access this dashboard.
            </p>
            <Button asChild>
              <Link href="/developer/signup">Become a Developer</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Developer Dashboard</h1>
            <p className="text-muted-foreground">Manage your bots and track your earnings</p>
          </div>
          <Button asChild data-testid="button-upload-new">
            <Link href="/developer/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload New Bot
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-mono text-3xl font-bold text-primary" data-testid="text-total-earnings">
                    ${stats?.totalEarnings || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">90% of all sales</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-mono text-3xl font-bold" data-testid="text-total-sales">
                    {stats?.totalSales || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Lifetime transactions</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Active Bots</p>
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-mono text-3xl font-bold" data-testid="text-active-bots">
                    {stats?.activeBots || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Published & approved</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <p className="font-mono text-3xl font-bold" data-testid="text-avg-rating">
                    {stats?.averageRating || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Across all bots</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="bots" data-testid="tab-my-bots">My Bots</TabsTrigger>
            <TabsTrigger value="sales" data-testid="tab-sales">Sales</TabsTrigger>
            <TabsTrigger value="payouts" data-testid="tab-payouts">Payouts</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">PayPal Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Sales Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {salesData && salesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                        }}
                      />
                      <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No sales data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                {recentSales && recentSales.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bot</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Your Earnings</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentSales.map((sale: any) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.botTitle}</TableCell>
                          <TableCell>{sale.buyerName}</TableCell>
                          <TableCell className="font-mono">${sale.amount}</TableCell>
                          <TableCell className="font-mono text-primary">${sale.developerEarnings}</TableCell>
                          <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No sales yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bots">
            <Card>
              <CardHeader>
                <CardTitle>My Bots</CardTitle>
              </CardHeader>
              <CardContent>
                {bots && bots.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bot</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Downloads</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bots.map((bot: any) => (
                        <TableRow key={bot.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {bot.thumbnailUrl && (
                                <img src={bot.thumbnailUrl} alt="" className="w-10 h-10 rounded object-cover" />
                              )}
                              <div>
                                <p className="font-medium">{bot.title}</p>
                                <p className="text-xs text-muted-foreground">{bot.category?.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={bot.status === 'approved' ? 'default' : 'secondary'}>
                              {bot.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">${bot.price}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              {bot.downloadCount}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              {bot.averageRating || '0.00'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/bot/${bot.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center">
                    <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't uploaded any bots yet</p>
                    <Button asChild>
                      <Link href="/developer/upload">Upload Your First Bot</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>All Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-12 text-center text-muted-foreground">
                  Sales history coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payout Requests</CardTitle>
                  <Button data-testid="button-request-payout">
                    Request Payout
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payoutRequests && payoutRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>PayPal Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Processed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutRequests.map((payout: any) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-mono text-primary">${payout.amount}</TableCell>
                          <TableCell>{payout.paypalEmail}</TableCell>
                          <TableCell>
                            <Badge>{payout.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No payout requests yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <PayPalSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
