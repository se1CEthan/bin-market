import { db } from "./db";
import { bots, users, transactions, reviews } from "../shared/schema";
import { eq, sql, desc, and, gte, lte, count, avg } from "drizzle-orm";

export interface BotAnalytics {
  views: number;
  downloads: number;
  revenue: string;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
  viewsThisWeek: number;
  downloadsThisWeek: number;
  revenueThisWeek: string;
  topCountries: Array<{ country: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
  userDemographics: {
    newUsers: number;
    returningUsers: number;
  };
}

export interface PlatformAnalytics {
  totalRevenue: string;
  totalBots: number;
  totalUsers: number;
  totalDevelopers: number;
  averageRating: number;
  topCategories: Array<{ name: string; count: number; revenue: string }>;
  monthlyGrowth: Array<{ month: string; bots: number; users: number; revenue: string }>;
  conversionFunnel: {
    visitors: number;
    botViews: number;
    purchases: number;
    conversionRate: number;
  };
}

export class AnalyticsService {
  static async getBotAnalytics(botId: string, developerId: string): Promise<BotAnalytics> {
    const bot = await db.select().from(bots).where(eq(bots.id, botId)).limit(1);
    if (!bot.length || bot[0].developerId !== developerId) {
      throw new Error("Bot not found or unauthorized");
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get basic stats
    const [botStats] = await db
      .select({
        views: bots.viewCount,
        downloads: bots.downloadCount,
        averageRating: bots.averageRating,
        reviewCount: bots.reviewCount,
      })
      .from(bots)
      .where(eq(bots.id, botId));

    // Get revenue
    const [revenueResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${transactions.developerEarnings}), '0')`,
        thisWeek: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.createdAt} >= ${weekAgo.toISOString()} THEN ${transactions.developerEarnings} ELSE 0 END), '0')`,
      })
      .from(transactions)
      .where(and(eq(transactions.botId, botId), eq(transactions.status, 'completed')));

    // Calculate conversion rate
    const conversionRate = botStats.views > 0 ? (botStats.downloads / botStats.views) * 100 : 0;

    // Mock data for advanced analytics (can be enhanced with real tracking)
    return {
      views: botStats.views,
      downloads: botStats.downloads,
      revenue: revenueResult.total,
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageRating: parseFloat(botStats.averageRating || '0'),
      reviewCount: botStats.reviewCount,
      viewsThisWeek: Math.floor(botStats.views * 0.2), // Mock: 20% of total views this week
      downloadsThisWeek: Math.floor(botStats.downloads * 0.15), // Mock: 15% of downloads this week
      revenueThisWeek: revenueResult.thisWeek,
      topCountries: [
        { country: 'United States', count: Math.floor(botStats.views * 0.4) },
        { country: 'United Kingdom', count: Math.floor(botStats.views * 0.2) },
        { country: 'Canada', count: Math.floor(botStats.views * 0.15) },
        { country: 'Australia', count: Math.floor(botStats.views * 0.1) },
        { country: 'Germany', count: Math.floor(botStats.views * 0.15) },
      ],
      dailyViews: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 50) + 10,
      })).reverse(),
      userDemographics: {
        newUsers: Math.floor(botStats.downloads * 0.7),
        returningUsers: Math.floor(botStats.downloads * 0.3),
      },
    };
  }

  static async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    // Get basic counts
    const [platformStats] = await db
      .select({
        totalBots: count(bots.id),
        totalUsers: count(users.id),
        totalDevelopers: sql<number>`COUNT(CASE WHEN ${users.isDeveloper} = true THEN 1 END)`,
        averageRating: avg(bots.averageRating),
      })
      .from(bots)
      .leftJoin(users, eq(users.id, bots.developerId));

    // Get total revenue
    const [revenueResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${transactions.amount}), '0')`,
      })
      .from(transactions)
      .where(eq(transactions.status, 'completed'));

    // Mock advanced analytics data
    return {
      totalRevenue: revenueResult.total,
      totalBots: platformStats.totalBots,
      totalUsers: platformStats.totalUsers,
      totalDevelopers: platformStats.totalDevelopers,
      averageRating: parseFloat(platformStats.averageRating?.toString() || '0'),
      topCategories: [
        { name: 'WhatsApp Bots', count: 25, revenue: '12500.00' },
        { name: 'Instagram Bots', count: 18, revenue: '9800.00' },
        { name: 'Business Tools', count: 15, revenue: '8200.00' },
        { name: 'AI Tools', count: 12, revenue: '7500.00' },
        { name: 'Scrapers', count: 10, revenue: '5200.00' },
      ],
      monthlyGrowth: Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toISOString().slice(0, 7),
          bots: Math.floor(Math.random() * 20) + 5,
          users: Math.floor(Math.random() * 100) + 50,
          revenue: (Math.random() * 5000 + 1000).toFixed(2),
        };
      }).reverse(),
      conversionFunnel: {
        visitors: 10000,
        botViews: 3500,
        purchases: 450,
        conversionRate: 4.5,
      },
    };
  }

  static async trackBotView(botId: string, userId?: string, userAgent?: string, ip?: string) {
    // Increment view count
    await db
      .update(bots)
      .set({
        viewCount: sql`${bots.viewCount} + 1`,
      })
      .where(eq(bots.id, botId));

    // In a real implementation, you'd also track:
    // - User session data
    // - Geographic location from IP
    // - Device/browser info from user agent
    // - Referrer information
    // - Time spent on page
  }

  static async trackBotDownload(botId: string, userId: string) {
    // Increment download count
    await db
      .update(bots)
      .set({
        downloadCount: sql`${bots.downloadCount} + 1`,
      })
      .where(eq(bots.id, botId));

    // Track conversion event
    // In a real implementation, you'd store this in an events table
  }
}