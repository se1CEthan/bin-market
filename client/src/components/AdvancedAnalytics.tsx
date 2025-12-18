import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  DollarSign,
  Star,
  Globe,
  Users,
  Target,
} from 'lucide-react';

interface AnalyticsProps {
  botId?: string;
  type: 'bot' | 'platform';
}

export function AdvancedAnalytics({ botId, type }: AnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/${type === 'bot' ? 'developer' : 'admin'}/analytics${botId ? `/${botId}` : ''}`],
    enabled: type === 'platform' || !!botId,
  });

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (type === 'bot' && analytics) {
    return <BotAnalytics data={analytics} />;
  }

  if (type === 'platform' && analytics) {
    return <PlatformAnalytics data={analytics} />;
  }

  return null;
}

function BotAnalytics({ data }: { data: any }) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{data.views.toLocaleString()}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{data.viewsThisWeek} this week
                </div>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Downloads</p>
                <p className="text-2xl font-bold">{data.downloads.toLocaleString()}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{data.downloadsThisWeek} this week
                </div>
              </div>
              <Download className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${parseFloat(data.revenue).toLocaleString()}</p>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +${parseFloat(data.revenueThisWeek).toFixed(2)} this week
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{data.conversionRate}%</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Target className="h-3 w-3 mr-1" />
                  {data.downloads}/{data.views} conversions
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Views (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.dailyViews}>
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
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCountries.map((country: any, index: number) => (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm">{country.country}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={(country.count / data.views) * 100}
                      className="w-20 h-2"
                    />
                    <span className="text-sm font-mono">{country.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>User Demographics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Users</span>
                <div className="flex items-center gap-2">
                  <Progress value={(data.userDemographics.newUsers / data.downloads) * 100} className="w-20 h-2" />
                  <span className="text-sm font-mono">{data.userDemographics.newUsers}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Returning Users</span>
                <div className="flex items-center gap-2">
                  <Progress value={(data.userDemographics.returningUsers / data.downloads) * 100} className="w-20 h-2" />
                  <span className="text-sm font-mono">{data.userDemographics.returningUsers}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Rating Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{data.averageRating}</div>
                <div className="flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(data.averageRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">{data.reviewCount} reviews</div>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2 mb-1">
                    <span className="text-xs w-2">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <Progress value={Math.random() * 100} className="flex-1 h-2" />
                    <span className="text-xs w-8">{Math.floor(Math.random() * 50)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PlatformAnalytics({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${parseFloat(data.totalRevenue).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bots</p>
                <p className="text-2xl font-bold">{data.totalBots}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Developers</p>
                <p className="text-2xl font-bold">{data.totalDevelopers}</p>
              </div>
              <Globe className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stackId="1"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCategories.map((category: any, index: number) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.name}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{category.count} bots</span>
                    <span className="text-sm font-mono">${parseFloat(category.revenue).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.conversionFunnel.visitors.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Visitors</div>
              <Progress value={100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.conversionFunnel.botViews.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Bot Views</div>
              <Progress value={(data.conversionFunnel.botViews / data.conversionFunnel.visitors) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.conversionFunnel.purchases.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Purchases</div>
              <Progress value={(data.conversionFunnel.purchases / data.conversionFunnel.visitors) * 100} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{data.conversionFunnel.conversionRate}%</div>
              <div className="text-sm text-muted-foreground">Conversion Rate</div>
              <Progress value={data.conversionFunnel.conversionRate} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}