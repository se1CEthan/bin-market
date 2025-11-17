import 'dotenv/config';
import { db } from '../server/db';
import { bots, users, categories } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function createTestBot() {
  try {
    // Get your user account
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: npm run create-test-bot <your-email>');
      process.exit(1);
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Make user a developer if not already
    if (!user.isDeveloper) {
      await db.update(users).set({ isDeveloper: true }).where(eq(users.id, user.id));
      console.log('✅ Made you a developer');
    }

    // Get first category
    const category = await db.query.categories.findFirst();
    if (!category) {
      console.error('❌ No categories found. Run: npm run seed:categories');
      process.exit(1);
    }

    // Create test bot
    const testBot = await db.insert(bots).values({
      title: 'WhatsApp Auto Responder Bot',
      description: 'Automatically respond to WhatsApp messages with custom replies. Perfect for businesses that want to provide instant customer support 24/7. Features include keyword detection, scheduled messages, and group management.',
      price: '29.99',
      developerId: user.id,
      categoryId: category.id,
      status: 'approved', // Already approved for testing
      features: ['Auto-reply to messages', 'Keyword detection', 'Schedule messages', 'Group management', '24/7 support'],
      supportedOS: ['Windows', 'macOS', 'Linux'],
      requirements: 'Python 3.8+, WhatsApp Web access',
      isFeatured: true,
    }).returning();

    console.log('✅ Test bot created successfully!');
    console.log(`Bot ID: ${testBot[0].id}`);
    console.log(`Title: ${testBot[0].title}`);
    console.log(`Status: ${testBot[0].status}`);
    console.log('\nYou can now see it at:');
    console.log('https://braininspirednetwork.cloud/bots');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestBot();
