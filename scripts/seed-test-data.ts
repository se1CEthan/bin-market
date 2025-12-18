import { db } from '../server/db';
import { users, bots, categories, transactions, reviews } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedTestData() {
  console.log('🌱 Seeding test data...');

  try {
    // Get existing categories
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      console.log('❌ No categories found. Please run seed:categories first.');
      return;
    }

    // Create test developers
    const testDevelopers = [
      {
        email: 'dev1@example.com',
        name: 'Alex Chen',
        isDeveloper: true,
        isEmailVerified: true,
      },
      {
        email: 'dev2@example.com',
        name: 'Sarah Johnson',
        isDeveloper: true,
        isEmailVerified: true,
      },
      {
        email: 'dev3@example.com',
        name: 'Mike Rodriguez',
        isDeveloper: true,
        isEmailVerified: true,
      },
      {
        email: 'dev4@example.com',
        name: 'Emma Davis',
        isDeveloper: true,
        isEmailVerified: true,
      },
    ];

    const createdDevelopers = [];
    for (const dev of testDevelopers) {
      const existing = await db.select().from(users).where(eq(users.email, dev.email));
      if (existing.length === 0) {
        const [created] = await db.insert(users).values(dev).returning();
        createdDevelopers.push(created);
        console.log(`✓ Created developer: ${dev.name}`);
      } else {
        createdDevelopers.push(existing[0]);
        console.log(`- Developer already exists: ${dev.name}`);
      }
    }

    // Create test buyers
    const testBuyers = [
      {
        email: 'buyer1@example.com',
        name: 'John Smith',
        isEmailVerified: true,
      },
      {
        email: 'buyer2@example.com',
        name: 'Lisa Wang',
        isEmailVerified: true,
      },
      {
        email: 'buyer3@example.com',
        name: 'David Brown',
        isEmailVerified: true,
      },
    ];

    const createdBuyers = [];
    for (const buyer of testBuyers) {
      const existing = await db.select().from(users).where(eq(users.email, buyer.email));
      if (existing.length === 0) {
        const [created] = await db.insert(users).values(buyer).returning();
        createdBuyers.push(created);
        console.log(`✓ Created buyer: ${buyer.name}`);
      } else {
        createdBuyers.push(existing[0]);
        console.log(`- Buyer already exists: ${buyer.name}`);
      }
    }

    // Create test bots
    const testBots = [
      {
        title: 'Instagram Auto-Poster',
        description: 'Automatically post content to Instagram with scheduling and hashtag optimization.',
        price: '29.99',
        developerId: createdDevelopers[0].id,
        categoryId: existingCategories.find(c => c.name === 'Social Media')?.id || existingCategories[0].id,
        status: 'approved',
        downloadCount: 156,
        viewCount: 1240,
        averageRating: '4.8',
        reviewCount: 23,
        features: ['Auto-posting', 'Hashtag optimization', 'Scheduling', 'Analytics'],
        supportedOS: ['Windows', 'macOS', 'Linux'],
      },
      {
        title: 'WhatsApp Business Bot',
        description: 'Automate customer service and marketing messages on WhatsApp Business.',
        price: '49.99',
        developerId: createdDevelopers[1].id,
        categoryId: existingCategories.find(c => c.name === 'Business & Productivity')?.id || existingCategories[0].id,
        status: 'approved',
        downloadCount: 89,
        viewCount: 567,
        averageRating: '4.6',
        reviewCount: 12,
        features: ['Auto-replies', 'Bulk messaging', 'Contact management', 'Analytics'],
        supportedOS: ['Windows', 'macOS'],
      },
      {
        title: 'E-commerce Price Monitor',
        description: 'Monitor competitor prices and automatically adjust your product pricing.',
        price: '39.99',
        developerId: createdDevelopers[2].id,
        categoryId: existingCategories.find(c => c.name === 'E-commerce')?.id || existingCategories[0].id,
        status: 'approved',
        downloadCount: 234,
        viewCount: 1890,
        averageRating: '4.9',
        reviewCount: 45,
        features: ['Price monitoring', 'Auto-adjustment', 'Competitor analysis', 'Alerts'],
        supportedOS: ['Windows', 'macOS', 'Linux'],
      },
      {
        title: 'AI Content Generator',
        description: 'Generate high-quality content using advanced AI for blogs, social media, and marketing.',
        price: '59.99',
        developerId: createdDevelopers[3].id,
        categoryId: existingCategories.find(c => c.name === 'AI & Machine Learning')?.id || existingCategories[0].id,
        status: 'approved',
        downloadCount: 312,
        viewCount: 2456,
        averageRating: '4.7',
        reviewCount: 67,
        features: ['AI writing', 'Multiple formats', 'SEO optimization', 'Plagiarism check'],
        supportedOS: ['Windows', 'macOS', 'Linux'],
      },
      {
        title: 'Data Scraper Pro',
        description: 'Extract data from websites with advanced scraping capabilities and export options.',
        price: '44.99',
        developerId: createdDevelopers[0].id,
        categoryId: existingCategories.find(c => c.name === 'Data Scraping')?.id || existingCategories[0].id,
        status: 'approved',
        downloadCount: 178,
        viewCount: 1123,
        averageRating: '4.5',
        reviewCount: 34,
        features: ['Web scraping', 'Data export', 'Proxy support', 'Scheduling'],
        supportedOS: ['Windows', 'Linux'],
      },
      {
        title: 'SEO Rank Tracker',
        description: 'Track your website rankings across multiple search engines and keywords.',
        price: '34.99',
        developerId: createdDevelopers[1].id,
        categoryId: existingCategories.find(c => c.name === 'Marketing & SEO')?.id || existingCategories[0].id,
        status: 'approved',
        downloadCount: 145,
        viewCount: 892,
        averageRating: '4.4',
        reviewCount: 28,
        features: ['Rank tracking', 'Keyword monitoring', 'Competitor analysis', 'Reports'],
        supportedOS: ['Windows', 'macOS'],
      },
    ];

    const createdBots = [];
    for (const bot of testBots) {
      const existing = await db.select().from(bots).where(eq(bots.title, bot.title));
      if (existing.length === 0) {
        const [created] = await db.insert(bots).values(bot).returning();
        createdBots.push(created);
        console.log(`✓ Created bot: ${bot.title}`);
      } else {
        createdBots.push(existing[0]);
        console.log(`- Bot already exists: ${bot.title}`);
      }
    }

    // Create test transactions
    const testTransactions = [
      {
        buyerId: createdBuyers[0].id,
        botId: createdBots[0].id,
        developerId: createdBots[0].developerId,
        amount: '29.99',
        platformFee: '2.99',
        developerEarnings: '26.99',
        paymentMethod: 'paypal',
        status: 'completed',
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        buyerId: createdBuyers[1].id,
        botId: createdBots[1].id,
        developerId: createdBots[1].developerId,
        amount: '49.99',
        platformFee: '4.99',
        developerEarnings: '44.99',
        paymentMethod: 'paypal',
        status: 'completed',
        completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
      {
        buyerId: createdBuyers[2].id,
        botId: createdBots[2].id,
        developerId: createdBots[2].developerId,
        amount: '39.99',
        platformFee: '3.99',
        developerEarnings: '35.99',
        paymentMethod: 'paypal',
        status: 'completed',
        completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        buyerId: createdBuyers[0].id,
        botId: createdBots[3].id,
        developerId: createdBots[3].developerId,
        amount: '59.99',
        platformFee: '5.99',
        developerEarnings: '53.99',
        paymentMethod: 'paypal',
        status: 'completed',
        completedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    ];

    for (const transaction of testTransactions) {
      const [created] = await db.insert(transactions).values(transaction).returning();
      console.log(`✓ Created transaction: ${created.amount} for bot ${transaction.botId}`);
    }

    // Create test reviews
    const testReviews = [
      {
        botId: createdBots[0].id,
        userId: createdBuyers[0].id,
        rating: 5,
        comment: 'Amazing bot! Works perfectly and saved me hours of manual posting.',
      },
      {
        botId: createdBots[1].id,
        userId: createdBuyers[1].id,
        rating: 4,
        comment: 'Great automation tool. Easy to set up and very reliable.',
      },
      {
        botId: createdBots[2].id,
        userId: createdBuyers[2].id,
        rating: 5,
        comment: 'Excellent price monitoring. Helped increase my profits significantly.',
      },
      {
        botId: createdBots[3].id,
        userId: createdBuyers[0].id,
        rating: 5,
        comment: 'The AI content quality is impressive. Highly recommended!',
      },
    ];

    for (const review of testReviews) {
      const [created] = await db.insert(reviews).values(review).returning();
      console.log(`✓ Created review: ${created.rating} stars for bot ${review.botId}`);
    }

    console.log('');
    console.log('✅ Test data seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`- Developers: ${createdDevelopers.length}`);
    console.log(`- Buyers: ${createdBuyers.length}`);
    console.log(`- Bots: ${createdBots.length}`);
    console.log(`- Transactions: ${testTransactions.length}`);
    console.log(`- Reviews: ${testReviews.length}`);

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
}

seedTestData().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});