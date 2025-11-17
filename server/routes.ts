import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireDeveloper, requireAdmin } from "./auth";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";

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

  // Public routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
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
      const bots = await storage.getTrendingBots(8);
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
      res.status(500).json({ error: "Failed to fetch trending bots" });
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

  // Protected routes - Developer
  app.post("/api/developer/signup", requireAuth, async (req, res) => {
    try {
      const user = await storage.updateUser((req.user as any).id, { isDeveloper: true });
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Failed to become developer" });
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
        status: 'pending',
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
      const platformFee = (amount * 0.05).toFixed(2);
      const developerEarnings = (amount * 0.95).toFixed(2);

      const transaction = await storage.createTransaction({
        buyerId: (req.user as any).id,
        botId: bot.id,
        developerId: bot.developerId,
        amount: amount.toString(),
        platformFee,
        developerEarnings,
        status: 'completed', // TODO: Integrate PayPal checkout flow
        paypalOrderId: `test-${Date.now()}`, // TODO: Real PayPal order ID
      });

      // Increment download count
      await storage.incrementBotDownloads(bot.id);

      res.json({ success: true, transaction });
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate purchase" });
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
