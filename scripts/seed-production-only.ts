import { db } from '../server/db';
import { categories } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedProductionOnly() {
  console.log('🚀 Setting up production database...');

  try {
    // Only add essential categories - no demo data
    const productionCategories = [
      {
        name: 'AI & Machine Learning',
        description: 'Artificial intelligence and machine learning automation tools',
        slug: 'ai-machine-learning',
      },
      {
        name: 'Social Media',
        description: 'Social media automation and management tools',
        slug: 'social-media',
      },
      {
        name: 'Business & Productivity',
        description: 'Business automation and productivity enhancement tools',
        slug: 'business-productivity',
      },
      {
        name: 'E-commerce',
        description: 'E-commerce automation and management solutions',
        slug: 'ecommerce',
      },
      {
        name: 'Data Scraping',
        description: 'Web scraping and data extraction tools',
        slug: 'data-scraping',
      },
      {
        name: 'Marketing & SEO',
        description: 'Digital marketing and SEO automation tools',
        slug: 'marketing-seo',
      },
      {
        name: 'Gaming',
        description: 'Gaming automation and enhancement tools',
        slug: 'gaming',
      },
      {
        name: 'Finance & Trading',
        description: 'Financial automation and trading tools',
        slug: 'finance-trading',
      },
      {
        name: 'Communication',
        description: 'Communication and messaging automation tools',
        slug: 'communication',
      },
      {
        name: 'Development Tools',
        description: 'Developer productivity and automation tools',
        slug: 'development-tools',
      },
    ];

    console.log('Adding essential categories...');
    for (const category of productionCategories) {
      const existing = await db.select().from(categories).where(eq(categories.name, category.name));
      if (existing.length === 0) {
        await db.insert(categories).values(category);
        console.log(`✓ Added category: ${category.name}`);
      } else {
        console.log(`- Category already exists: ${category.name}`);
      }
    }

    console.log('');
    console.log('✅ Production database ready!');
    console.log('');
    console.log('📊 Database Status:');
    console.log('- Categories: Essential categories added');
    console.log('- Users: Empty (ready for real registrations)');
    console.log('- Bots: Empty (ready for real uploads)');
    console.log('- Transactions: Empty (ready for real purchases)');
    console.log('- Reviews: Empty (ready for real reviews)');
    console.log('');
    console.log('🎯 Ready for real users and real usage!');

  } catch (error) {
    console.error('❌ Error setting up production database:', error);
  }
}

seedProductionOnly().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});