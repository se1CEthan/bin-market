import { db } from './db';
import { categories, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  // Seed categories
  const categoryData = [
    { name: 'WhatsApp', description: 'WhatsApp automation bots', icon: 'MessageSquare' },
    { name: 'Instagram', description: 'Instagram automation bots', icon: 'Instagram' },
    { name: 'Scrapers', description: 'Web scraping and data extraction bots', icon: 'Bot' },
    { name: 'Business Tools', description: 'Business automation and productivity bots', icon: 'Briefcase' },
    { name: 'AI Tools', description: 'AI-powered automation bots', icon: 'Sparkles' },
  ];

  for (const cat of categoryData) {
    const existing = await db.select().from(categories).where(eq(categories.name, cat.name));
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
      console.log(`Created category: ${cat.name}`);
    }
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
