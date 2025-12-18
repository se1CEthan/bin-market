import { db } from "./db";
import { bots, users, transactions, reviews, categories } from "../shared/schema";
import { eq, sql, desc, and, inArray, ne } from "drizzle-orm";

export interface RecommendationEngine {
  getUserRecommendations(userId: string): Promise<BotRecommendation[]>;
  getSimilarBots(botId: string): Promise<BotRecommendation[]>;
  getTrendingRecommendations(): Promise<BotRecommendation[]>;
  getPersonalizedFeed(userId: string): Promise<BotRecommendation[]>;
}

export interface BotRecommendation {
  bot: any;
  score: number;
  reason: string;
  confidence: number;
  tags: string[];
}

export class AIRecommendationEngine implements RecommendationEngine {
  
  async getUserRecommendations(userId: string): Promise<BotRecommendation[]> {
    // Get user's purchase history and preferences
    const userPurchases = await db
      .select({
        botId: transactions.botId,
        categoryId: bots.categoryId,
        price: bots.price,
        features: bots.features,
      })
      .from(transactions)
      .innerJoin(bots, eq(transactions.botId, bots.id))
      .where(and(eq(transactions.buyerId, userId), eq(transactions.status, 'completed')));

    // Get user's review patterns
    const userReviews = await db
      .select({
        botId: reviews.botId,
        rating: reviews.rating,
        categoryId: bots.categoryId,
      })
      .from(reviews)
      .innerJoin(bots, eq(reviews.botId, bots.id))
      .where(eq(reviews.userId, userId));

    // Analyze user preferences
    const preferences = this.analyzeUserPreferences(userPurchases, userReviews);
    
    // Get candidate bots (excluding already purchased)
    const purchasedBotIds = userPurchases.map(p => p.botId);
    const candidateBots = await db
      .select()
      .from(bots)
      .where(and(
        eq(bots.status, 'approved'),
        purchasedBotIds.length > 0 ? ne(bots.id, purchasedBotIds[0]) : sql`true`
      ))
      .limit(50);

    // Score and rank recommendations
    const recommendations = candidateBots.map(bot => {
      const score = this.calculateRecommendationScore(bot, preferences);
      const reason = this.generateRecommendationReason(bot, preferences);
      
      return {
        bot,
        score,
        reason,
        confidence: Math.min(score / 100, 1),
        tags: this.generateRecommendationTags(bot, preferences),
      };
    });

    return recommendations
      .filter(r => r.score > 30)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async getSimilarBots(botId: string): Promise<BotRecommendation[]> {
    const targetBot = await db.select().from(bots).where(eq(bots.id, botId)).limit(1);
    if (!targetBot.length) return [];

    const bot = targetBot[0];
    
    // Find similar bots based on category, features, and price range
    const similarBots = await db
      .select()
      .from(bots)
      .where(and(
        eq(bots.status, 'approved'),
        ne(bots.id, botId),
        eq(bots.categoryId, bot.categoryId)
      ))
      .limit(20);

    const recommendations = similarBots.map(similarBot => {
      const score = this.calculateSimilarityScore(bot, similarBot);
      
      return {
        bot: similarBot,
        score,
        reason: `Similar to ${bot.title}`,
        confidence: score / 100,
        tags: ['similar', 'same-category'],
      };
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  async getTrendingRecommendations(): Promise<BotRecommendation[]> {
    // Get trending bots based on recent activity
    const trendingBots = await db
      .select({
        ...bots,
        recentDownloads: sql<number>`COUNT(${transactions.id})`,
        avgRating: sql<number>`AVG(${reviews.rating})`,
      })
      .from(bots)
      .leftJoin(transactions, and(
        eq(transactions.botId, bots.id),
        sql`${transactions.createdAt} > NOW() - INTERVAL '7 days'`
      ))
      .leftJoin(reviews, eq(reviews.botId, bots.id))
      .where(eq(bots.status, 'approved'))
      .groupBy(bots.id)
      .orderBy(desc(sql`COUNT(${transactions.id})`), desc(bots.viewCount))
      .limit(15);

    return trendingBots.map(bot => ({
      bot,
      score: 85 + Math.random() * 15,
      reason: 'Trending this week',
      confidence: 0.9,
      tags: ['trending', 'popular'],
    }));
  }

  async getPersonalizedFeed(userId: string): Promise<BotRecommendation[]> {
    const userRecommendations = await this.getUserRecommendations(userId);
    const trendingRecommendations = await this.getTrendingRecommendations();
    
    // Mix personalized and trending recommendations
    const mixed = [
      ...userRecommendations.slice(0, 6),
      ...trendingRecommendations.slice(0, 4),
    ];

    return mixed.sort((a, b) => b.score - a.score);
  }

  private analyzeUserPreferences(purchases: any[], reviews: any[]) {
    const categoryPreferences = new Map<string, number>();
    const priceRanges = purchases.map(p => parseFloat(p.price));
    const features = purchases.flatMap(p => p.features || []);

    // Analyze category preferences
    purchases.forEach(p => {
      categoryPreferences.set(p.categoryId, (categoryPreferences.get(p.categoryId) || 0) + 1);
    });

    reviews.forEach(r => {
      if (r.rating >= 4) {
        categoryPreferences.set(r.categoryId, (categoryPreferences.get(r.categoryId) || 0) + 0.5);
      }
    });

    return {
      categories: Array.from(categoryPreferences.entries()).sort((a, b) => b[1] - a[1]),
      avgPrice: priceRanges.length > 0 ? priceRanges.reduce((a, b) => a + b, 0) / priceRanges.length : 50,
      maxPrice: Math.max(...priceRanges, 100),
      preferredFeatures: this.getTopFeatures(features),
    };
  }

  private calculateRecommendationScore(bot: any, preferences: any): number {
    let score = 50; // Base score

    // Category preference boost
    const categoryMatch = preferences.categories.find(([catId]: [string, number]) => catId === bot.categoryId);
    if (categoryMatch) {
      score += categoryMatch[1] * 20;
    }

    // Price preference
    const botPrice = parseFloat(bot.price);
    const priceDiff = Math.abs(botPrice - preferences.avgPrice);
    const priceScore = Math.max(0, 20 - (priceDiff / preferences.avgPrice) * 20);
    score += priceScore;

    // Feature matching
    const botFeatures = bot.features || [];
    const featureMatches = botFeatures.filter((f: string) => preferences.preferredFeatures.includes(f));
    score += featureMatches.length * 5;

    // Rating boost
    const rating = parseFloat(bot.averageRating || '0');
    score += rating * 5;

    // Popularity boost
    score += Math.min(bot.downloadCount / 100, 10);

    return Math.min(score, 100);
  }

  private calculateSimilarityScore(bot1: any, bot2: any): number {
    let score = 0;

    // Same category
    if (bot1.categoryId === bot2.categoryId) score += 30;

    // Similar price range
    const price1 = parseFloat(bot1.price);
    const price2 = parseFloat(bot2.price);
    const priceDiff = Math.abs(price1 - price2);
    const priceScore = Math.max(0, 20 - (priceDiff / Math.max(price1, price2)) * 20);
    score += priceScore;

    // Feature overlap
    const features1 = bot1.features || [];
    const features2 = bot2.features || [];
    const commonFeatures = features1.filter((f: string) => features2.includes(f));
    score += commonFeatures.length * 10;

    // Similar ratings
    const rating1 = parseFloat(bot1.averageRating || '0');
    const rating2 = parseFloat(bot2.averageRating || '0');
    const ratingDiff = Math.abs(rating1 - rating2);
    score += Math.max(0, 15 - ratingDiff * 3);

    return Math.min(score, 100);
  }

  private generateRecommendationReason(bot: any, preferences: any): string {
    const reasons = [];

    const categoryMatch = preferences.categories.find(([catId]: [string, number]) => catId === bot.categoryId);
    if (categoryMatch) {
      reasons.push("matches your interests");
    }

    const botPrice = parseFloat(bot.price);
    if (Math.abs(botPrice - preferences.avgPrice) < preferences.avgPrice * 0.3) {
      reasons.push("in your price range");
    }

    const rating = parseFloat(bot.averageRating || '0');
    if (rating >= 4.5) {
      reasons.push("highly rated");
    }

    if (bot.downloadCount > 100) {
      reasons.push("popular choice");
    }

    return reasons.length > 0 ? `Recommended because it ${reasons.join(" and ")}` : "Recommended for you";
  }

  private generateRecommendationTags(bot: any, preferences: any): string[] {
    const tags = [];

    const categoryMatch = preferences.categories.find(([catId]: [string, number]) => catId === bot.categoryId);
    if (categoryMatch) tags.push("preferred-category");

    const rating = parseFloat(bot.averageRating || '0');
    if (rating >= 4.5) tags.push("highly-rated");
    if (bot.downloadCount > 100) tags.push("popular");
    if (parseFloat(bot.price) < 20) tags.push("affordable");

    return tags;
  }

  private getTopFeatures(features: string[]): string[] {
    const featureCount = new Map<string, number>();
    features.forEach(f => {
      featureCount.set(f, (featureCount.get(f) || 0) + 1);
    });

    return Array.from(featureCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature]) => feature);
  }
}

export const aiRecommendationEngine = new AIRecommendationEngine();