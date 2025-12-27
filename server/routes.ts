import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireDeveloper, requireAdmin } from "./auth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { AuthService } from "./services/auth";
import { PayPalService } from "./services/paypal";
import { LicenseService } from "./services/license";
import { sendPurchaseConfirmation } from "./services/email";

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // PayPal routes
  app.get("/api/paypal/setup", loadPaypalDefault);
  app.post("/api/paypal/order", createPaypalOrder);
  app.post("/api/paypal/order/:orderID/capture", capturePaypalOrder);

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      const result = await AuthService.registerUser(email, password, name);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await AuthService.loginUser(email, password);
      
      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      res.json({ user, message: "Login successful" });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: "Verification token is required" });
      }

      const result = await AuthService.verifyEmail(token);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await AuthService.resendVerificationEmail(email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const result = await AuthService.requestPasswordReset(email);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters long" });
      }

      const result = await AuthService.resetPassword(token, password);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: "New password must be at least 8 characters long" });
      }

      const result = await AuthService.changePassword((req.user as any).id, currentPassword, newPassword);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });



  // Enhanced PayPal routes (Primary Payment Method)
  app.post("/api/paypal/create-order", requireAuth, async (req, res) => {
    try {
      const { botId, amount } = req.body;
      
      if (!botId || !amount) {
        return res.status(400).json({ error: "Bot ID and amount are required" });
      }

      // Use request origin as a fallback for return URLs when FRONTEND_URL is not configured
      const origin = req.get('origin') || `${req.protocol}://${req.get('host')}`;
      const order = await PayPalService.createOrder(
        botId,
        (req.user as any).id,
        parseFloat(amount),
        'USD',
        origin,
      );

      res.json(order);
    } catch (error: any) {
      console.error('PayPal order creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/paypal/capture-order", requireAuth, async (req, res) => {
    try {
      const { orderId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }

      const result = await PayPalService.captureOrder(orderId);
      res.json(result);
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // License and download routes
  app.get("/api/licenses", requireAuth, async (req, res) => {
    try {
      const licenses = await LicenseService.getUserLicenses((req.user as any).id);
      res.json(licenses);
    } catch (error: any) {
      console.error('Get licenses error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/licenses/validate", async (req, res) => {
    try {
      const { licenseKey, botId } = req.body;
      
      if (!licenseKey) {
        return res.status(400).json({ error: "License key is required" });
      }

      const result = await LicenseService.validateLicense(licenseKey, botId);
      res.json(result);
    } catch (error: any) {
      console.error('License validation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/download/:token", requireAuth, async (req, res) => {
    try {
      const { token } = req.params;
      
      const downloadInfo = await LicenseService.getDownloadUrl(token, (req.user as any).id);
      
      // Redirect to actual file or serve file
      if (downloadInfo.fileUrl) {
        // If it's a local file path, serve it
        if (downloadInfo.fileUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), downloadInfo.fileUrl);
          res.download(filePath, downloadInfo.fileName);
        } else {
          // If it's an external URL, redirect
          res.redirect(downloadInfo.fileUrl);
        }
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Public routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error('Stats API error:', error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/bots/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const bots = await storage.getTrendingBots(limit);
      const botsWithDetails = await Promise.all(
        bots.map(async (bot) => {
          const developer = await storage.getUser(bot.developerId);
          const category = await storage.getCategoryById(bot.categoryId);
          return {
            ...bot,
            developer: developer ? { name: developer.name, avatarUrl: developer.avatarUrl } : null,
            category: category ? { name: category.name } : null,
          };
        })
      );
      res.json(botsWithDetails);
    } catch (error) {
      console.error('Trending bots API error:', error);
      res.status(500).json({ error: "Failed to fetch trending bots" });
    }
  });

  app.get("/api/bots/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const bots = await storage.getMostPopularBots(limit);
      const botsWithDetails = await Promise.all(
        bots.map(async (bot) => {
          const developer = await storage.getUser(bot.developerId);
          const category = await storage.getCategoryById(bot.categoryId);
          return {
            ...bot,
            developer: developer ? { name: developer.name, avatarUrl: developer.avatarUrl } : null,
            category: category ? { name: category.name } : null,
          };
        })
      );
      res.json(botsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch popular bots" });
    }
  });

  app.get("/api/bots/new-releases", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const bots = await storage.getNewReleaseBots(limit);
      const botsWithDetails = await Promise.all(
        bots.map(async (bot) => {
          const developer = await storage.getUser(bot.developerId);
          const category = await storage.getCategoryById(bot.categoryId);
          return {
            ...bot,
            developer: developer ? { name: developer.name, avatarUrl: developer.avatarUrl } : null,
            category: category ? { name: category.name } : null,
          };
        })
      );
      res.json(botsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch new releases" });
    }
  });

  app.get("/api/activity/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activity = await storage.getRecentActivity(limit);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent activity" });
    }
  });

  app.get("/api/bots", async (req, res) => {
    try {
      const { search, category, sortBy, minPrice, maxPrice } = req.query;
      const filters = {
        search: search as string,
        categoryId: category as string,
        sortBy: sortBy as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        status: 'approved',
      };

      const bots = await storage.getBots(filters);
      const botsWithDetails = await Promise.all(
        bots.map(async (bot) => {
          const developer = await storage.getUser(bot.developerId);
          const category = await storage.getCategoryById(bot.categoryId);
          return {
            ...bot,
            developer: developer ? { name: developer.name, avatarUrl: developer.avatarUrl } : null,
            category: category ? { name: category.name } : null,
          };
        })
      );
      res.json(botsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/:id", async (req, res) => {
    try {
      const bot = await storage.getBotById(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      await storage.incrementBotViews(bot.id);

      const developer = await storage.getUser(bot.developerId);
      const category = await storage.getCategoryById(bot.categoryId);
      
      let hasPurchased = false;
      if (req.user) {
        hasPurchased = await storage.hasPurchased((req.user as any).id, bot.id);
      }

      res.json({
        ...bot,
        developer: developer ? {
          id: developer.id,
          name: developer.name,
          avatarUrl: developer.avatarUrl,
          email: developer.email,
        } : null,
        category: category ? { name: category.name } : null,
        hasPurchased,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bot" });
    }
  });

  app.get("/api/bots/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByBot(req.params.id);
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            user: user ? { name: user.name, avatarUrl: user.avatarUrl } : null,
          };
        })
      );
      res.json(reviewsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Analytics routes
  app.get("/api/developer/analytics/:botId", requireDeveloper, async (req, res) => {
    try {
      const { AnalyticsService } = await import('./analytics');
      const analytics = await AnalyticsService.getBotAnalytics(req.params.botId, (req.user as any).id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/analytics", requireAdmin, async (req, res) => {
    try {
      const { AnalyticsService } = await import('./analytics');
      const analytics = await AnalyticsService.getPlatformAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch platform analytics" });
    }
  });

  // Advanced search routes
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string' || query.length < 2) {
        return res.json([]);
      }

      // Mock search suggestions - in production, use Elasticsearch or similar
      const suggestions = [
        { id: '1', text: 'WhatsApp automation', type: 'category', count: 25 },
        { id: '2', text: 'Instagram bot', type: 'bot', trending: true },
        { id: '3', text: 'Data scraper', type: 'bot', count: 15 },
        { id: '4', text: 'Business automation', type: 'category', count: 30 },
      ].filter(s => s.text.toLowerCase().includes(query.toLowerCase()));

      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.get("/api/search/trending", async (req, res) => {
    try {
      // Mock trending searches - in production, track real search data
      const trending = [
        'WhatsApp automation',
        'Instagram followers',
        'Data scraping',
        'Email marketing',
        'Social media bot',
      ];
      res.json(trending);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending searches" });
    }
  });

  app.get("/api/search/recommendations", requireAuth, async (req, res) => {
    try {
      // Mock AI recommendations based on user behavior
      const recommendations = [
        { id: '1', text: 'WhatsApp business bot', type: 'bot' },
        { id: '2', text: 'Social media scheduler', type: 'bot' },
        { id: '3', text: 'Lead generation tool', type: 'bot' },
      ];
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      // Mock notifications - in production, fetch from database
      const notifications = [
        {
          id: '1',
          type: 'sale',
          title: 'New Sale!',
          message: 'Your WhatsApp Bot was purchased',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { amount: '49.99' },
        },
        {
          id: '2',
          type: 'review',
          title: 'New Review',
          message: 'Someone left a 5-star review on your bot',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      // Mock unread count
      res.json({ count: 3 });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      // Mock mark as read
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark as read" });
    }
  });

  app.patch("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      // Mock mark all as read
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to mark all as read" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req, res) => {
    try {
      // Mock delete notification
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // AI Recommendations routes
  app.get("/api/recommendations/user", requireAuth, async (req, res) => {
    try {
      const { aiRecommendationEngine } = await import('./ai-recommendations');
      const recommendations = await aiRecommendationEngine.getUserRecommendations((req.user as any).id);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/recommendations/similar/:botId", async (req, res) => {
    try {
      const { aiRecommendationEngine } = await import('./ai-recommendations');
      const recommendations = await aiRecommendationEngine.getSimilarBots(req.params.botId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch similar bots" });
    }
  });

  app.get("/api/recommendations/trending", async (req, res) => {
    try {
      const { aiRecommendationEngine } = await import('./ai-recommendations');
      const recommendations = await aiRecommendationEngine.getTrendingRecommendations();
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending recommendations" });
    }
  });

  app.get("/api/recommendations/feed", requireAuth, async (req, res) => {
    try {
      const { aiRecommendationEngine } = await import('./ai-recommendations');
      const feed = await aiRecommendationEngine.getPersonalizedFeed((req.user as any).id);
      res.json(feed);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personalized feed" });
    }
  });

  // Social features routes
  app.post("/api/bots/:id/like", requireAuth, async (req, res) => {
    try {
      // Mock implementation - in production, store in database
      res.json({ success: true, liked: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to like bot" });
    }
  });

  app.post("/api/bots/:id/bookmark", requireAuth, async (req, res) => {
    try {
      // Mock implementation - in production, store in database
      res.json({ success: true, bookmarked: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to bookmark bot" });
    }
  });

  app.get("/api/bots/:id/social-stats", async (req, res) => {
    try {
      // Mock social stats
      res.json({
        likes: Math.floor(Math.random() * 100) + 10,
        bookmarks: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 30) + 2,
        isLiked: Math.random() > 0.5,
        isBookmarked: Math.random() > 0.7,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch social stats" });
    }
  });

  app.get("/api/bots/:id/comments", async (req, res) => {
    try {
      // Mock comments data
      const comments = [
        {
          id: '1',
          userId: 'user1',
          user: {
            name: 'John Doe',
            avatarUrl: null,
            isDeveloper: false,
            isVerified: false,
          },
          content: 'Great bot! Works perfectly for my automation needs.',
          likes: 5,
          dislikes: 0,
          replies: [],
          createdAt: new Date().toISOString(),
          isEdited: false,
        },
        {
          id: '2',
          userId: 'user2',
          user: {
            name: 'Jane Smith',
            avatarUrl: null,
            isDeveloper: true,
            isVerified: true,
          },
          content: 'Excellent work! The documentation is very clear.',
          likes: 8,
          dislikes: 1,
          replies: [],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isEdited: false,
        },
      ];
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/bots/:id/comments", requireAuth, async (req, res) => {
    try {
      const { content, parentId } = req.body;
      // Mock comment creation
      const newComment = {
        id: Date.now().toString(),
        userId: (req.user as any).id,
        user: {
          name: (req.user as any).name,
          avatarUrl: (req.user as any).avatarUrl,
          isDeveloper: (req.user as any).isDeveloper,
          isVerified: false,
        },
        content,
        likes: 0,
        dislikes: 0,
        replies: [],
        createdAt: new Date().toISOString(),
        isEdited: false,
      };
      res.json(newComment);
    } catch (error) {
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  app.get("/api/developers/:id/profile", async (req, res) => {
    try {
      // Mock developer profile
      const profile = {
        id: req.params.id,
        name: 'Bot Developer',
        avatarUrl: null,
        bio: 'Experienced automation developer with 5+ years in the industry.',
        followers: Math.floor(Math.random() * 1000) + 100,
        following: Math.floor(Math.random() * 200) + 50,
        totalBots: Math.floor(Math.random() * 20) + 5,
        totalSales: Math.floor(Math.random() * 500) + 100,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        badges: ['verified', 'top-seller'],
        isFollowing: Math.random() > 0.5,
        isVerified: true,
        joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch developer profile" });
    }
  });

  app.post("/api/developers/:id/follow", requireAuth, async (req, res) => {
    try {
      // Mock follow action
      res.json({ success: true, following: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to follow developer" });
    }
  });

  // Collections routes
  app.get("/api/collections", requireAuth, async (req, res) => {
    try {
      // Mock collections data
      const collections = [
        {
          id: '1',
          name: 'My Favorite Automation Bots',
          description: 'A curated collection of my most useful bots',
          isPublic: false,
          botCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bots: [],
          tags: ['automation', 'productivity'],
          likes: 0,
          isLiked: false,
        },
      ];
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.post("/api/collections", requireAuth, async (req, res) => {
    try {
      const { name, description, isPublic } = req.body;
      const newCollection = {
        id: Date.now().toString(),
        name,
        description,
        isPublic,
        botCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bots: [],
        tags: [],
        likes: 0,
        isLiked: false,
      };
      res.json(newCollection);
    } catch (error) {
      res.status(500).json({ error: "Failed to create collection" });
    }
  });

  app.get("/api/collections/public", async (req, res) => {
    try {
      // Mock public collections
      const collections = [
        {
          id: '1',
          name: 'Best WhatsApp Bots 2024',
          description: 'Top-rated WhatsApp automation bots',
          isPublic: true,
          botCount: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          bots: [],
          tags: ['whatsapp', 'messaging'],
          likes: 45,
          isLiked: false,
        },
      ];
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch public collections" });
    }
  });

  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      // Mock wishlist data
      const wishlist = [
        {
          id: '1',
          botId: 'bot1',
          bot: {
            id: 'bot1',
            title: 'Advanced Instagram Bot',
            description: 'Automate your Instagram engagement',
            price: '49.99',
            thumbnailUrl: null,
          },
          addedAt: new Date().toISOString(),
          priority: 'high',
          notes: 'Need this for my marketing campaign',
        },
      ];
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const { botId, priority, notes } = req.body;
      const newItem = {
        id: Date.now().toString(),
        botId,
        addedAt: new Date().toISOString(),
        priority,
        notes,
      };
      res.json(newItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  // Bot management routes
  app.patch("/api/developer/bots/:id", requireDeveloper, async (req, res) => {
    try {
      const bot = await storage.updateBot(req.params.id, req.body);
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot" });
    }
  });

  app.delete("/api/developer/bots/:id", requireDeveloper, async (req, res) => {
    try {
      await storage.deleteBot(req.params.id, (req.user as any).id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete bot" });
    }
  });

  app.patch("/api/developer/bots/:id/featured", requireDeveloper, async (req, res) => {
    try {
      const { isFeatured } = req.body;
      const bot = await storage.updateBot(req.params.id, { isFeatured });
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to update featured status" });
    }
  });

  // Protected routes - Developer
  app.post("/api/developer/signup", requireAuth, async (req, res) => {
    try {
      const user = await storage.updateUser((req.user as any).id, { isDeveloper: true });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to become developer" });
    }
  });

  app.post("/api/developer/paypal", requireDeveloper, async (req, res) => {
    try {
      const { paypalEmail, paypalEnabled } = req.body;
      
      if (!paypalEmail || typeof paypalEmail !== 'string') {
        return res.status(400).json({ error: "Valid PayPal email is required" });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paypalEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const user = await storage.updateUser((req.user as any).id, {
        paypalEmail,
        paypalEnabled: paypalEnabled !== false, // Default to true
      });

      res.json({ 
        success: true,
        paypalEmail: user?.paypalEmail,
        paypalEnabled: user?.paypalEnabled,
      });
    } catch (error) {
      console.error('PayPal setup error:', error);
      res.status(500).json({ error: "Failed to update PayPal settings" });
    }
  });

  app.get("/api/developer/paypal", requireDeveloper, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      res.json({
        paypalEmail: user?.paypalEmail || null,
        paypalEnabled: user?.paypalEnabled || false,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PayPal settings" });
    }
  });

  app.get("/api/developer/stats", requireDeveloper, async (req, res) => {
    try {
      const stats = await storage.getDeveloperStats((req.user as any).id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/developer/bots", requireDeveloper, async (req, res) => {
    try {
      const bots = await storage.getBotsByDeveloper((req.user as any).id);
      const botsWithDetails = await Promise.all(
        bots.map(async (bot) => {
          const category = await storage.getCategoryById(bot.categoryId);
          return {
            ...bot,
            category: category ? { name: category.name } : null,
          };
        })
      );
      res.json(botsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bots" });
    }
  });

  app.get("/api/developer/sales", requireDeveloper, async (req, res) => {
    try {
      // Return mock data for now - can be enhanced with real sales data grouped by date
      res.json([
        { date: '2024-01', sales: 5, earnings: 475 },
        { date: '2024-02', sales: 8, earnings: 760 },
        { date: '2024-03', sales: 12, earnings: 1140 },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales data" });
    }
  });

  app.get("/api/developer/recent-sales", requireDeveloper, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByDeveloper((req.user as any).id);
      const salesWithDetails = await Promise.all(
        transactions.slice(0, 10).map(async (transaction) => {
          const bot = await storage.getBotById(transaction.botId);
          const buyer = await storage.getUser(transaction.buyerId);
          return {
            ...transaction,
            botTitle: bot?.title,
            buyerName: buyer?.name,
          };
        })
      );
      res.json(salesWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent sales" });
    }
  });

  app.get("/api/developer/payouts", requireDeveloper, async (req, res) => {
    try {
      const payouts = await storage.getPayoutRequestsByDeveloper((req.user as any).id);
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  app.post("/api/bots/upload", requireDeveloper, upload.fields([
    { name: 'botFile', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'demoVideo', maxCount: 1 },
    { name: 'screenshots', maxCount: 5 },
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const { title, description, price, categoryId, requirements, supportedOS, features } = req.body;

      const botData: any = {
        title,
        description,
        price,
        categoryId,
        developerId: (req.user as any).id,
        status: 'approved',
      };

      if (requirements) botData.requirements = requirements;
      if (supportedOS) botData.supportedOS = JSON.parse(supportedOS);
      if (features) botData.features = JSON.parse(features);

      if (files.botFile?.[0]) {
        botData.fileUrl = `/uploads/${files.botFile[0].filename}`;
        botData.fileName = files.botFile[0].originalname;
      }

      if (files.thumbnail?.[0]) {
        botData.thumbnailUrl = `/uploads/${files.thumbnail[0].filename}`;
      }

      if (files.demoVideo?.[0]) {
        botData.demoVideoUrl = `/uploads/${files.demoVideo[0].filename}`;
      }

      if (files.screenshots) {
        botData.screenshots = files.screenshots.map(file => `/uploads/${file.filename}`);
      }

      const bot = await storage.createBot(botData);
      res.json(bot);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: "Failed to upload bot" });
    }
  });

  app.post("/api/bots/:id/purchase", requireAuth, async (req, res) => {
    try {
      const bot = await storage.getBotById(req.params.id);
      if (!bot) {
        return res.status(404).json({ error: "Bot not found" });
      }

      const hasPurchased = await storage.hasPurchased((req.user as any).id, bot.id);
      if (hasPurchased) {
        return res.status(400).json({ error: "Already purchased" });
      }

      const amount = parseFloat(bot.price);
      console.log('Bot price raw value:', bot.price);
      // Allow free bots (0.00). Only reject NaN or negative prices.
      if (!isFinite(amount) || amount < 0) {
        console.error(`Invalid bot price for bot ${bot.id}:`, bot.price);
        return res.status(400).json({ error: 'Invalid bot price. Please set a valid non-negative price for this bot.' });
      }
      const platformFee = (amount * 0.10).toFixed(2);
      const developerEarnings = (amount * 0.90).toFixed(2);

      // If the bot is free (price 0), complete the purchase immediately without PayPal
      if (amount === 0) {
        const transaction = await storage.createTransaction({
          buyerId: (req.user as any).id,
          botId: bot.id,
          developerId: bot.developerId,
          amount: '0.00',
          platformFee: '0.00',
          developerEarnings: '0.00',
          paymentMethod: 'free',
          paypalOrderId: null,
          status: 'completed',
        });

        // Generate license and increment download count
        const licenseData = await LicenseService.generateLicense(transaction.id, bot.id, (req.user as any).id);
        await storage.incrementBotDownloads(bot.id);

        // Send confirmation email if user has email
        try {
          const buyer = await storage.getUser((req.user as any).id);
          if (buyer?.email) {
            await sendPurchaseConfirmation(
              buyer.email,
              buyer.name,
              bot.title,
              transaction.id,
              transaction.amount,
              licenseData.licenseKey,
              licenseData.downloadUrl,
              licenseData.maxDownloads
            );
          }
        } catch (emailErr) {
          console.error('Failed to send purchase confirmation email for free purchase:', emailErr);
        }

        return res.json({ success: true, transaction, license: licenseData });
      }

      // Create PayPal order via internal PayPalService directly (avoid internal HTTP call requiring session cookies)
      console.log('Creating PayPal order (server-side) for bot:', bot.id, 'price:', bot.price);
      const paypalOrder = await PayPalService.createOrder(bot.id, (req.user as any).id, amount);
      console.log('PayPal order response (server-side):', paypalOrder && paypalOrder.id ? `id=${paypalOrder.id}` : JSON.stringify(paypalOrder).slice(0, 2000));

      // Create transaction record
      const transaction = await storage.createTransaction({
        buyerId: (req.user as any).id,
        botId: bot.id,
        developerId: bot.developerId,
        amount: amount.toString(),
        platformFee,
        developerEarnings,
        status: 'pending',
        paypalOrderId: paypalOrder.id,
      });

      res.json({ 
        success: true, 
        paypalOrderId: paypalOrder.id,
        approvalUrl: paypalOrder.links.find((link: any) => link.rel === 'approve')?.href,
        transaction 
      });
    } catch (error: any) {
      console.error('Purchase error:', error?.message || error);
      if (error?.stack) console.error(error.stack);
      try {
        // attempt to return meaningful message to client if available
        res.status(500).json({ error: error?.message || 'Failed to initiate purchase', details: (error && error.toString()) });
      } catch (err) {
        res.status(500).json({ error: 'Failed to initiate purchase' });
      }
    }
  });

  // Capture PayPal payment after user approves
  app.post("/api/bots/:id/capture/:orderId", requireAuth, async (req, res) => {
    try {
      const { orderId } = req.params;

      // Capture the PayPal order
      const captureResponse = await fetch(`${req.protocol}://${req.get('host')}/api/paypal/order/${orderId}/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!captureResponse.ok) {
        throw new Error('Failed to capture PayPal payment');
      }

      const captureData = await captureResponse.json();

      // Update transaction status
      const transaction = await storage.getTransactionByPaypalOrderId(orderId);
      if (transaction) {
        await storage.updateTransactionStatus(transaction.id, 'completed');
        
        // Increment download count
        const bot = await storage.getBotById(req.params.id);
        if (bot) {
          await storage.incrementBotDownloads(bot.id);
          
          // Send automatic payout to developer if PayPal is enabled
          const developer = await storage.getUser(bot.developerId);
          if (developer?.paypalEnabled && developer?.paypalEmail) {
            try {
              const { sendAutomaticPayout } = await import('./paypal-payout');
              const amount = parseFloat(transaction.amount);
              
              const payoutResult = await sendAutomaticPayout(
                developer.paypalEmail,
                amount,
                bot.title,
                transaction.id
              );

              if (payoutResult.success) {
                console.log(`Automatic payout sent to ${developer.paypalEmail}: $${(amount * 0.90).toFixed(2)}`);
                // Update transaction with payout info
                await storage.updateTransaction(transaction.id, {
                  status: 'completed',
                });
              } else {
                console.error('Automatic payout failed:', payoutResult.error);
                // Transaction is still completed, but payout failed
                // Admin can manually process or retry
              }
            } catch (payoutError) {
              console.error('Payout processing error:', payoutError);
              // Continue - payment was captured successfully
            }
          }
        }
      }

      res.json({ success: true, captureData });
    } catch (error) {
      console.error('Capture error:', error);
      res.status(500).json({ error: "Failed to capture payment" });
    }
  });

  // Protected routes - User account
  app.get("/api/account/purchases", requireAuth, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByBuyer((req.user as any).id);
      const purchasesWithDetails = await Promise.all(
        transactions.filter(t => t.status === 'completed').map(async (transaction) => {
          const bot = await storage.getBotById(transaction.botId);
          return {
            ...transaction,
            bot: bot ? {
              id: bot.id,
              title: bot.title,
              thumbnailUrl: bot.thumbnailUrl,
            } : null,
          };
        })
      );
      res.json(purchasesWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchases" });
    }
  });

  // Protected routes - Admin
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/pending-bots", requireAdmin, async (req, res) => {
    try {
      const bots = await storage.getPendingBots();
      const botsWithDetails = await Promise.all(
        bots.map(async (bot) => {
          const developer = await storage.getUser(bot.developerId);
          const category = await storage.getCategoryById(bot.categoryId);
          return {
            ...bot,
            developer: developer ? { name: developer.name } : null,
            category: category ? { name: category.name } : null,
          };
        })
      );
      res.json(botsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending bots" });
    }
  });

  app.post("/api/admin/bots/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const bot = await storage.updateBot(req.params.id, { status });
      res.json(bot);
    } catch (error) {
      res.status(500).json({ error: "Failed to update bot status" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'register' && message.userId) {
          clients.set(message.userId, ws);
        }

        if (message.type === 'send_message' && message.receiverId && message.message) {
          const chatMessage = await storage.createChatMessage({
            senderId: message.senderId,
            receiverId: message.receiverId,
            botId: message.botId || null,
            message: message.message,
          });

          const sender = await storage.getUser(message.senderId);
          const messageWithSender = {
            ...chatMessage,
            sender: sender ? { name: sender.name, avatarUrl: sender.avatarUrl } : null,
          };

          const receiverWs = clients.get(message.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'message',
              message: messageWithSender,
            }));
          }

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'message',
              message: messageWithSender,
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      for (const [userId, socket] of clients.entries()) {
        if (socket === ws) {
          clients.delete(userId);
          break;
        }
      }
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
