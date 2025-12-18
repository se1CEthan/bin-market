/**
 * Advanced System Dashboard
 * Comprehensive monitoring and analytics dashboard
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AdvancedSpinner, LoadingScreen } from '@/components/ui/advanced-loading';
import { 
  Activity, 
  Users, 
  Bot, 
  TrendingUp, 
  Zap, 
  Shield, 
  Database, 
  Network,
  Cpu,
  Memory,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Globe,
  Server,
  Eye,
  Download,
  Star,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/lib/analytics';
import { AdvancedCache } from '@/lib/performance';

interface SystemMetrics {
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  users: {
    online: number;
    total: number;
    newToday: number;
    activeThisWeek: number;
  };
  bots: {
    total: number;
    published: number;
    pending: number;
    downloads: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  system: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
}

export default function SystemDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const { track } = useAnalytics();

  useEffect(() => {
    track('system_dashboard_viewed');
    loadMetrics();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateRealTimeData();
    }, 5000);

    return () => clearInterval(interval);
  }, [track]);

  const loadMetrics = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setMetrics({
      performance: {
        responseTime: 145,
        throughput: 1250,
        errorRate: 0.02,
        uptime: 99.97,
      },
      users: {
        online: 1247,
        total: 15632,
        newToday: 89,
        activeThisWeek: 8934,
      },
      bots: {
        total: 2847,
        published: 2756,
        pending: 91,
        downloads: 156789,
      },
      revenue: {
        today: 12450,
        thisMonth: 345600,
        totalRevenue: 2456789,
        averageOrderValue: 45.67,
      },
      system: {
        cpuUsage: 34,
        memoryUsage: 67,
        diskUsage: 45,
        networkLatency: 23,
      },
    });
    
    setLoading(false);
  };

  const updateRealTimeData = () => {
    const newDataPoint = {
      timestamp: Date.now(),
      users: Math.floor(Math.random() * 100) + 1200,
      requests: Math.floor(Math.random() * 500) + 1000,
      errors: Math.floor(Math.random() * 10),
    };
    
    setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
  };

  if (loading) {
    return <LoadingScreen variant="neural" message="Loading System Dashboard..." />;
  }

  if (!metrics) {
    return <div>Error loading metrics</div>;
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = "primary",
    format = "number"
  }: {
    title: string;
    value: number;
    change?: number;
    icon: any;
    color?: string;
    format?: "number" | "percentage" | "currency" | "time";
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case "percentage":
          return `${val.toFixed(2)}%`;
        case "currency":
          return `$${val.toLocaleString()}`;
        case "time":
          return `${val}ms`;
        default:
          return val.toLocaleString();
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p 
                className="text-3xl font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatValue(value)}
              </motion.p>
              {change !== undefined && (
                <div className={cn(
                  "flex items-center text-sm",
                  change >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  <TrendingUp className={cn(
                    "w-4 h-4 mr-1",
                    change < 0 && "rotate-180"
                  )} />
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Icon className={cn("w-8 h-8", `text-${color}-500`)} />
            </motion.div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const SystemHealthCard = ({ 
    title, 
    value, 
    threshold = 80,
    icon: Icon 
  }: {
    title: string;
    value: number;
    threshold?: number;
    icon: any;
  }) => {
    const getHealthColor = (val: number) => {
      if (val < threshold * 0.7) return "text-green-500";
      if (val < threshold) return "text-yellow-500";
      return "text-red-500";
    };

    const getHealthStatus = (val: number) => {
      if (val < threshold * 0.7) return "Healthy";
      if (val < threshold) return "Warning";
      return "Critical";
    };

    return (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{title}</span>
          </div>
          <Badge 
            variant={value < threshold * 0.7 ? "default" : value < threshold ? "secondary" : "destructive"}
            className="text-xs"
          >
            {getHealthStatus(value)}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Usage</span>
            <span className={getHealthColor(value)}>{value}%</span>
          </div>
          <Progress value={value} className="h-2" />
        </div>
      </Card>
    );
  };

  return (
    <motion.div
      className="min-h-screen p-6 bg-gradient-to-br from-background via-muted/20 to-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              System Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and analytics for BIN Market
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              System Online
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMetrics}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <MetricCard
            title="Online Users"
            value={metrics.users.online}
            change={12.5}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Total Bots"
            value={metrics.bots.total}
            change={8.3}
            icon={Bot}
            color="purple"
          />
          <MetricCard
            title="Revenue Today"
            value={metrics.revenue.today}
            change={15.7}
            icon={DollarSign}
            color="green"
            format="currency"
          />
          <MetricCard
            title="System Uptime"
            value={metrics.performance.uptime}
            change={0.1}
            icon={Shield}
            color="emerald"
            format="percentage"
          />
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bots">Bots</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Activity */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Real-time Activity</h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </Badge>
                </div>
                <div className="space-y-4">
                  {realTimeData.slice(-5).map((data, index) => (
                    <motion.div
                      key={data.timestamp}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-primary" />
                        <span className="text-sm">
                          {data.users} users, {data.requests} requests
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(data.timestamp).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <Eye className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{metrics.bots.downloads.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Downloads</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 rounded-lg">
                    <Star className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{metrics.performance.responseTime}ms</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg">
                    <Globe className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">47</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Response Time"
                value={metrics.performance.responseTime}
                change={-5.2}
                icon={Zap}
                color="yellow"
                format="time"
              />
              <MetricCard
                title="Throughput"
                value={metrics.performance.throughput}
                change={12.8}
                icon={TrendingUp}
                color="blue"
              />
              <MetricCard
                title="Error Rate"
                value={metrics.performance.errorRate}
                change={-15.3}
                icon={AlertTriangle}
                color="red"
                format="percentage"
              />
              <MetricCard
                title="Uptime"
                value={metrics.performance.uptime}
                change={0.1}
                icon={CheckCircle}
                color="green"
                format="percentage"
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Users"
                value={metrics.users.total}
                change={8.5}
                icon={Users}
                color="blue"
              />
              <MetricCard
                title="Online Now"
                value={metrics.users.online}
                change={12.3}
                icon={Activity}
                color="green"
              />
              <MetricCard
                title="New Today"
                value={metrics.users.newToday}
                change={25.7}
                icon={TrendingUp}
                color="purple"
              />
              <MetricCard
                title="Active This Week"
                value={metrics.users.activeThisWeek}
                change={15.2}
                icon={Clock}
                color="orange"
              />
            </div>
          </TabsContent>

          <TabsContent value="bots" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Bots"
                value={metrics.bots.total}
                change={6.8}
                icon={Bot}
                color="purple"
              />
              <MetricCard
                title="Published"
                value={metrics.bots.published}
                change={7.2}
                icon={CheckCircle}
                color="green"
              />
              <MetricCard
                title="Pending Review"
                value={metrics.bots.pending}
                change={-12.5}
                icon={Clock}
                color="yellow"
              />
              <MetricCard
                title="Total Downloads"
                value={metrics.bots.downloads}
                change={18.9}
                icon={Download}
                color="blue"
              />
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SystemHealthCard
                title="CPU Usage"
                value={metrics.system.cpuUsage}
                threshold={80}
                icon={Cpu}
              />
              <SystemHealthCard
                title="Memory Usage"
                value={metrics.system.memoryUsage}
                threshold={85}
                icon={Memory}
              />
              <SystemHealthCard
                title="Disk Usage"
                value={metrics.system.diskUsage}
                threshold={90}
                icon={HardDrive}
              />
              <SystemHealthCard
                title="Network Latency"
                value={metrics.system.networkLatency}
                threshold={100}
                icon={Wifi}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}