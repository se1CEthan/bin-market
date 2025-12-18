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
import { Shield, Users, Bot, DollarSign, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
  });

  const { data: pendingBots } = useQuery({
    queryKey: ['/api/admin/pending-bots'],
  });

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold" data-testid="text-total-users">
                {stats?.totalUsers || '0'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Bots</p>
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold" data-testid="text-total-bots">
                {stats?.totalBots || '0'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Platform Revenue</p>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold text-primary" data-testid="text-platform-revenue">
                ${stats?.platformRevenue || '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <Shield className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="font-mono text-3xl font-bold" data-testid="text-pending-approvals">
                {stats?.pendingApprovals || '0'}
              </p>
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
