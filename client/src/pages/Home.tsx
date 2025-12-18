import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveActivityFeed } from '@/components/LiveActivityFeed';
import { AdvancedMarketplace } from '@/components/AdvancedMarketplace';
import { useAuth } from '@/contexts/AuthContext';
import { useLiveStats } from '@/lib/live-data';
import { pageTransition } from '@/lib/animations';
import { 
  Zap, 
  Shield, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { stats } = useLiveStats();

  return (
    <motion.div 
      className="min-h-screen"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="container relative mx-auto px-4 md:px-6 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Production Ready • Live Since 2024
                </Badge>
                
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                  Buy & Sell
                  <span className="text-blue-600 dark:text-blue-400"> Automation Bots</span>
                  <br />
                  That Actually Work
                </h1>
                
                <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                  The world's most trusted marketplace for automation software. 
                  <strong> Instant delivery</strong>, <strong>verified sellers</strong>, 
                  and <strong>90% revenue share</strong> for developers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/bots">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                    Browse Bots
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/developer/signup">
                  <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                    Start Selling
                    <DollarSign className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="p-6 bg-white/80 backdrop-blur border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-semibold">Live Platform Activity</span>
                </div>
                
                {stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.onlineUsers?.toLocaleString() || '1,247'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Users Online</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalBots?.toLocaleString() || '2,847'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Live Bots</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        ${stats.revenueToday?.toLocaleString() || '12,450'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Revenue Today</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {stats.salesToday || '156'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Sales Today</div>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-white/80 backdrop-blur border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Recent Activity
                </h3>
                <LiveActivityFeed maxItems={4} showHeader={false} className="border-0 p-0 bg-transparent" />
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-muted/30 to-background">
        <div className="container mx-auto px-4 md:px-6">
          <AdvancedMarketplace />
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-transparent to-transparent relative overflow-hidden">
        <div className="container relative mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Ready to Automate Your Life or Start Earning?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of satisfied customers and developers on the BIN marketplace
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/bots">
                  Browse Bots
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={user?.isDeveloper ? "/developer/upload" : "/developer/signup"}>
                  Become a Developer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
