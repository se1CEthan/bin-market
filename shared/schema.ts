import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Google OAuth authenticated users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  googleId: text("google_id").unique(),
  isDeveloper: boolean("is_developer").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  paypalEmail: text("paypal_email"), // Developer's PayPal email for automatic payouts
  paypalEnabled: boolean("paypal_enabled").default(false).notNull(), // Whether automatic payouts are enabled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bot categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  botCount: integer("bot_count").default(0).notNull(),
});

// Bots table - automation bots listed on marketplace
export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  developerId: varchar("developer_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  thumbnailUrl: text("thumbnail_url"),
  demoVideoUrl: text("demo_video_url"),
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  screenshots: jsonb("screenshots").$type<string[]>().default([]),
  features: jsonb("features").$type<string[]>().default([]),
  requirements: text("requirements"),
  supportedOS: jsonb("supported_os").$type<string[]>().default([]),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  isFeatured: boolean("is_featured").default(false).notNull(),
  featuredUntil: timestamp("featured_until"),
  viewCount: integer("view_count").default(0).notNull(),
  downloadCount: integer("download_count").default(0).notNull(),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions - bot purchases
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  botId: varchar("bot_id").notNull().references(() => bots.id),
  developerId: varchar("developer_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  developerEarnings: decimal("developer_earnings", { precision: 10, scale: 2 }).notNull(),
  paypalOrderId: text("paypal_order_id"),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reviews - bot ratings and reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botId: varchar("bot_id").notNull().references(() => bots.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat messages - real-time communication between buyers and developers
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  botId: varchar("bot_id").references(() => bots.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payout requests - developer withdrawal requests
export const payoutRequests = pgTable("payout_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  developerId: varchar("developer_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, paid, rejected
  paypalEmail: text("paypal_email").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  botsCreated: many(bots),
  purchases: many(transactions, { relationName: "buyer" }),
  sales: many(transactions, { relationName: "developer" }),
  reviews: many(reviews),
  messagesSent: many(chatMessages, { relationName: "sender" }),
  messagesReceived: many(chatMessages, { relationName: "receiver" }),
  payoutRequests: many(payoutRequests),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  bots: many(bots),
}));

export const botsRelations = relations(bots, ({ one, many }) => ({
  developer: one(users, {
    fields: [bots.developerId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [bots.categoryId],
    references: [categories.id],
  }),
  transactions: many(transactions),
  reviews: many(reviews),
  chatMessages: many(chatMessages),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  buyer: one(users, {
    fields: [transactions.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  developer: one(users, {
    fields: [transactions.developerId],
    references: [users.id],
    relationName: "developer",
  }),
  bot: one(bots, {
    fields: [transactions.botId],
    references: [bots.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  bot: one(bots, {
    fields: [reviews.botId],
    references: [bots.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [chatMessages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  bot: one(bots, {
    fields: [chatMessages.botId],
    references: [bots.id],
  }),
}));

export const payoutRequestsRelations = relations(payoutRequests, ({ one }) => ({
  developer: one(users, {
    fields: [payoutRequests.developerId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
  downloadCount: true,
  averageRating: true,
  reviewCount: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof bots.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;
export type PayoutRequest = typeof payoutRequests.$inferSelect;
