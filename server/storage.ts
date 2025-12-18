import {
  users,
  categories,
  bots,
  transactions,
  reviews,
  chatMessages,
  payoutRequests,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Bot,
  type InsertBot,
  type Transaction,
  type InsertTransaction,
  type Review,
  type InsertReview,
  type ChatMessage,
  type InsertChatMessage,
  type PayoutRequest,
  type InsertPayoutRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, gte, lte, ilike } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategoryBotCount(id: string, increment: number): Promise<void>;

  // Bots
  getBots(filters?: { categoryId?: string; search?: string; minPrice?: number; maxPrice?: number; status?: string; sortBy?: string }): Promise<Bot[]>;
  getBotById(id: string): Promise<Bot | undefined>;
  getBotsByDeveloper(developerId: string): Promise<Bot[]>;
  getTrendingBots(limit?: number): Promise<Bot[]>;
  getMostPopularBots(limit?: number): Promise<Bot[]>;
  getNewReleaseBots(limit?: number): Promise<Bot[]>;
  getRecentActivity(limit?: number): Promise<any[]>;
  getPendingBots(): Promise<Bot[]>;
  createBot(bot: InsertBot): Promise<Bot>;
  updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined>;
  incrementBotViews(id: string): Promise<void>;
  incrementBotDownloads(id: string): Promise<void>;
  updateBotRating(botId: string): Promise<void>;

  // Transactions
  getTransactionById(id: string): Promise<Transaction | undefined>;
  getTransactionsByBuyer(buyerId: string): Promise<Transaction[]>;
  getTransactionsByDeveloper(developerId: string): Promise<Transaction[]>;
  getTransactionsByBot(botId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionByPaypalOrderId(paypalOrderId: string): Promise<Transaction | undefined>;
  updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  hasPurchased(userId: string, botId: string): Promise<boolean>;

  // Reviews
  getReviewsByBot(botId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Chat Messages
  getMessagesBetween(userId1: string, userId2: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(receiverId: string, senderId: string): Promise<void>;

  // Payout Requests
  getPayoutRequestsByDeveloper(developerId: string): Promise<PayoutRequest[]>;
  getPendingPayouts(): Promise<PayoutRequest[]>;
  createPayoutRequest(payout: InsertPayoutRequest): Promise<PayoutRequest>;
  updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<PayoutRequest | undefined>;

  // Stats
  getDeveloperStats(developerId: string): Promise<any>;
  getAdminStats(): Promise<any>;
  getPlatformStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategoryBotCount(id: string, increment: number): Promise<void> {
    await db.update(categories)
      .set({ botCount: sql`${categories.botCount} + ${increment}` })
      .where(eq(categories.id, id));
  }

  // Bots
  async getBots(filters?: { categoryId?: string; search?: string; minPrice?: number; maxPrice?: number; status?: string; sortBy?: string }): Promise<Bot[]> {
    let query = db.select().from(bots).$dynamic();

    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(bots.status, filters.status));
    } else {
      conditions.push(eq(bots.status, 'approved'));
    }

    if (filters?.categoryId) {
      conditions.push(eq(bots.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(bots.title, `%${filters.search}%`),
          ilike(bots.description, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.minPrice !== undefined) {
      conditions.push(gte(bots.price, filters.minPrice.toString()));
    }

    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(bots.price, filters.maxPrice.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)!);
    }

    // Sorting
    if (filters?.sortBy === 'newest') {
      query = query.orderBy(desc(bots.createdAt));
    } else if (filters?.sortBy === 'price-low') {
      query = query.orderBy(bots.price);
    } else if (filters?.sortBy === 'price-high') {
      query = query.orderBy(desc(bots.price));
    } else if (filters?.sortBy === 'rating') {
      query = query.orderBy(desc(bots.averageRating));
    } else if (filters?.sortBy === 'downloads') {
      query = query.orderBy(desc(bots.downloadCount));
    } else {
      // Default: trending (combination of views, downloads, and recency)
      query = query.orderBy(desc(bots.downloadCount), desc(bots.viewCount), desc(bots.createdAt));
    }

    return await query;
  }

  async getBotById(id: string): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot || undefined;
  }

  async getBotsByDeveloper(developerId: string): Promise<Bot[]> {
    return await db.select().from(bots)
      .where(eq(bots.developerId, developerId))
      .orderBy(desc(bots.createdAt));
  }

  async getTrendingBots(limit: number = 8): Promise<Bot[]> {
    // Simplified trending = highest downloads and views
    return await db.select().from(bots)
      .where(eq(bots.status, 'approved'))
      .orderBy(desc(bots.downloadCount), desc(bots.viewCount), desc(bots.averageRating))
      .limit(limit);
  }

  async getMostPopularBots(limit: number = 8): Promise<Bot[]> {
    // Most popular = highest download count + rating
    return await db.select().from(bots)
      .where(eq(bots.status, 'approved'))
      .orderBy(
        desc(bots.downloadCount),
        desc(bots.averageRating),
        desc(bots.reviewCount)
      )
      .limit(limit);
  }

  async getNewReleaseBots(limit: number = 8): Promise<Bot[]> {
    // New releases = recently created and approved
    return await db.select().from(bots)
      .where(eq(bots.status, 'approved'))
      .orderBy(desc(bots.createdAt))
      .limit(limit);
  }

  async getRecentActivity(limit: number = 20): Promise<any[]> {
    // Get recent transactions with bot and user details
    const recentTransactions = await db.select({
      id: transactions.id,
      type: sql<string>`'purchase'`,
      createdAt: transactions.createdAt,
      botId: transactions.botId,
      botTitle: bots.title,
      buyerName: users.name,
      amount: transactions.amount,
    })
    .from(transactions)
    .leftJoin(bots, eq(bots.id, transactions.botId))
    .leftJoin(users, eq(users.id, transactions.buyerId))
    .where(eq(transactions.status, 'completed'))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);

    // Get recent bot uploads
    const recentUploads = await db.select({
      id: bots.id,
      type: sql<string>`'upload'`,
      createdAt: bots.createdAt,
      botId: bots.id,
      botTitle: bots.title,
      buyerName: users.name,
      amount: sql<string>`null`,
    })
    .from(bots)
    .leftJoin(users, eq(users.id, bots.developerId))
    .where(eq(bots.status, 'approved'))
    .orderBy(desc(bots.createdAt))
    .limit(Math.floor(limit / 2));

    // Combine and sort by date
    const allActivity = [...recentTransactions, ...recentUploads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return allActivity;
  }

  async getPendingBots(): Promise<Bot[]> {
    return await db.select().from(bots)
      .where(eq(bots.status, 'pending'))
      .orderBy(desc(bots.createdAt));
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const [bot] = await db.insert(bots).values(insertBot).returning();
    await this.updateCategoryBotCount(bot.categoryId, 1);
    return bot;
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined> {
    const [bot] = await db.update(bots).set({ ...updates, updatedAt: new Date() }).where(eq(bots.id, id)).returning();
    return bot || undefined;
  }

  async deleteBot(id: string, developerId: string): Promise<Bot | undefined> {
    const [bot] = await db.delete(bots).where(and(eq(bots.id, id), eq(bots.developerId, developerId))).returning();
    if (bot) {
      await this.updateCategoryBotCount(bot.categoryId, -1);
    }
    return bot || undefined;
  }

  async incrementBotViews(id: string): Promise<void> {
    await db.update(bots)
      .set({ viewCount: sql`${bots.viewCount} + 1` })
      .where(eq(bots.id, id));
  }

  async incrementBotDownloads(id: string): Promise<void> {
    await db.update(bots)
      .set({ downloadCount: sql`${bots.downloadCount} + 1` })
      .where(eq(bots.id, id));
  }

  async updateBotRating(botId: string): Promise<void> {
    const result = await db.select({
      avgRating: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.botId, botId));

    if (result[0]) {
      await db.update(bots)
        .set({
          averageRating: result[0].avgRating?.toFixed(2) || '0.00',
          reviewCount: Number(result[0].count),
        })
        .where(eq(bots.id, botId));
    }
  }

  // Transactions
  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getTransactionsByBuyer(buyerId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.buyerId, buyerId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByDeveloper(developerId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.developerId, developerId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByBot(botId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.botId, botId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getTransactionByPaypalOrderId(paypalOrderId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions)
      .where(eq(transactions.paypalOrderId, paypalOrderId));
    return transaction || undefined;
  }

  async updateTransactionStatus(id: string, status: string): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const [transaction] = await db.update(transactions).set(updates).where(eq(transactions.id, id)).returning();
    return transaction || undefined;
  }

  async hasPurchased(userId: string, botId: string): Promise<boolean> {
    const [transaction] = await db.select().from(transactions)
      .where(and(
        eq(transactions.buyerId, userId),
        eq(transactions.botId, botId),
        eq(transactions.status, 'completed')
      ));
    return !!transaction;
  }

  // Reviews
  async getReviewsByBot(botId: string): Promise<Review[]> {
    return await db.select().from(reviews)
      .where(eq(reviews.botId, botId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    await this.updateBotRating(review.botId);
    return review;
  }

  // Chat Messages
  async getMessagesBetween(userId1: string, userId2: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(or(
        and(eq(chatMessages.senderId, userId1), eq(chatMessages.receiverId, userId2)),
        and(eq(chatMessages.senderId, userId2), eq(chatMessages.receiverId, userId1))
      ))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.receiverId, receiverId),
        eq(chatMessages.senderId, senderId)
      ));
  }

  // Payout Requests
  async getPayoutRequestsByDeveloper(developerId: string): Promise<PayoutRequest[]> {
    return await db.select().from(payoutRequests)
      .where(eq(payoutRequests.developerId, developerId))
      .orderBy(desc(payoutRequests.createdAt));
  }

  async getPendingPayouts(): Promise<PayoutRequest[]> {
    return await db.select().from(payoutRequests)
      .where(eq(payoutRequests.status, 'pending'))
      .orderBy(payoutRequests.createdAt);
  }

  async createPayoutRequest(insertPayout: InsertPayoutRequest): Promise<PayoutRequest> {
    const [payout] = await db.insert(payoutRequests).values(insertPayout).returning();
    return payout;
  }

  async updatePayoutRequest(id: string, updates: Partial<PayoutRequest>): Promise<PayoutRequest | undefined> {
    const [payout] = await db.update(payoutRequests).set(updates).where(eq(payoutRequests.id, id)).returning();
    return payout || undefined;
  }

  // Stats
  async getDeveloperStats(developerId: string): Promise<any> {
    const salesResult = await db.select({
      totalSales: sql<number>`COUNT(*)`,
      totalEarnings: sql<number>`SUM(${transactions.developerEarnings})`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.developerId, developerId),
      eq(transactions.status, 'completed')
    ));

    const botsResult = await db.select({
      activeBots: sql<number>`COUNT(*)`,
      avgRating: sql<number>`AVG(${bots.averageRating})`,
    })
    .from(bots)
    .where(and(
      eq(bots.developerId, developerId),
      eq(bots.status, 'approved')
    ));

    return {
      totalSales: salesResult[0]?.totalSales || 0,
      totalEarnings: salesResult[0]?.totalEarnings?.toFixed(2) || '0.00',
      activeBots: botsResult[0]?.activeBots || 0,
      averageRating: botsResult[0]?.avgRating?.toFixed(2) || '0.00',
    };
  }

  async getAdminStats(): Promise<any> {
    const usersCount = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const botsCount = await db.select({ count: sql<number>`COUNT(*)` }).from(bots);
    const pendingCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(bots)
      .where(eq(bots.status, 'pending'));
    const revenueResult = await db.select({
      revenue: sql<number>`SUM(${transactions.platformFee})`,
    })
    .from(transactions)
    .where(eq(transactions.status, 'completed'));

    return {
      totalUsers: usersCount[0]?.count || 0,
      totalBots: botsCount[0]?.count || 0,
      pendingApprovals: pendingCount[0]?.count || 0,
      platformRevenue: revenueResult[0]?.revenue?.toFixed(2) || '0.00',
    };
  }

  async getPlatformStats(): Promise<any> {
    // Get current date for time-based queries
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total approved bots
    const totalBotsResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(bots)
      .where(eq(bots.status, 'approved'));

    // Active bots (with downloads or views in last 30 days)
    const activeBotsResult = await db.select({ count: sql<number>`COUNT(DISTINCT ${bots.id})` })
      .from(bots)
      .leftJoin(transactions, eq(transactions.botId, bots.id))
      .where(and(
        eq(bots.status, 'approved'),
        or(
          gte(transactions.createdAt, thisMonth),
          gte(bots.updatedAt, thisMonth)
        )
      ));

    // New bots this week
    const newBotsThisWeekResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(bots)
      .where(and(
        eq(bots.status, 'approved'),
        gte(bots.createdAt, thisWeek)
      ));

    // Featured bots
    const featuredBotsResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(bots)
      .where(and(
        eq(bots.status, 'approved'),
        eq(bots.isFeatured, true)
      ));

    // Total downloads
    const totalDownloadsResult = await db.select({
      total: sql<number>`COALESCE(SUM(${bots.downloadCount}), 0)`,
    }).from(bots);

    // Downloads today
    const downloadsToday = await db.select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'completed'),
        gte(transactions.completedAt, today)
      ));

    // Sales today
    const salesToday = await db.select({ 
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`COALESCE(SUM(CAST(${transactions.amount} AS DECIMAL)), 0)`
    })
      .from(transactions)
      .where(and(
        eq(transactions.status, 'completed'),
        gte(transactions.completedAt, today)
      ));

    // Total users
    const totalUsersResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users);

    // Active users (logged in this month)
    const activeUsersResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(gte(users.lastLoginAt, thisMonth));

    // Total developers
    const totalDevelopersResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(eq(users.isDeveloper, true));

    // Average rating across all bots
    const averageRatingResult = await db.select({
      avg: sql<number>`COALESCE(AVG(CAST(${bots.averageRating} AS DECIMAL)), 0)`
    }).from(bots).where(eq(bots.status, 'approved'));

    // Total reviews
    const totalReviewsResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(reviews);

    // Recent activity count (last 24 hours)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentActivityResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(transactions)
      .where(gte(transactions.createdAt, yesterday));

    return {
      // Bot statistics
      totalBots: totalBotsResult[0]?.count || 0,
      activeBots: activeBotsResult[0]?.count || 0,
      newBotsThisWeek: newBotsThisWeekResult[0]?.count || 0,
      featuredBots: featuredBotsResult[0]?.count || 0,
      
      // Download statistics
      totalDownloads: totalDownloadsResult[0]?.total || 0,
      downloadsToday: downloadsToday[0]?.count || 0,
      
      // Sales statistics
      salesToday: salesToday[0]?.count || 0,
      revenueToday: salesToday[0]?.revenue || 0,
      
      // User statistics
      totalUsers: totalUsersResult[0]?.count || 0,
      activeUsers: activeUsersResult[0]?.count || 0,
      totalDevelopers: totalDevelopersResult[0]?.count || 0,
      
      // Quality metrics
      averageRating: Number(Number(averageRatingResult[0]?.avg || 0).toFixed(1)),
      totalReviews: totalReviewsResult[0]?.count || 0,
      
      // Activity metrics
      recentActivity: recentActivityResult[0]?.count || 0,
      
      // Calculated metrics
      conversionRate: totalUsersResult[0]?.count > 0 
        ? Number(((salesToday[0]?.count || 0) / totalUsersResult[0].count * 100).toFixed(2))
        : 0,
    };
  }
}

export const storage = new DatabaseStorage();
