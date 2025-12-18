import 'dotenv/config';
import { db } from '../server/db';
import { categories } from '../shared/schema';

const defaultCategories = [
  {
    name: 'AI & Machine Learning',
    description: 'Bots powered by artificial intelligence and machine learning',
    icon: '🤖',
  },
  {
    name: 'Social Media',
    description: 'Automation for social media platforms',
    icon: '📱',
  },
  {
    name: 'Business & Productivity',
    description: 'Tools to streamline business operations and boost productivity',
    icon: '💼',
  },
  {
    name: 'E-commerce',
    description: 'Automation for online stores and marketplaces',
    icon: '🛒',
  },
  {
    name: 'Data Scraping',
    description: 'Extract and collect data from websites',
    icon: '🔍',
  },
  {
    name: 'Marketing & SEO',
    description: 'Marketing automation and SEO tools',
    icon: '📊',
  },
  {
    name: 'Gaming',
    description: 'Bots for gaming automation and enhancement',
    icon: '🎮',
  },
  {
    name: 'Finance & Trading',
    description: 'Financial automation and trading bots',
    icon: '💰',
  },
];

async function seedCategories() {
  try {
    console.log('Seeding categories...');
    
    for (const category of defaultCategories) {
      await db.insert(categories).values(category).onConflictDoNothing();
      console.log(`✓ Added category: ${category.name}`);
    }
    
    console.log('\n✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
