import 'dotenv/config';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Usage: npm run make-admin <email>');
    console.error('Example: npm run make-admin your@email.com');
    process.exit(1);
  }

  try {
    const result = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log(`✅ Successfully made ${email} an admin!`);
    console.log(`You can now access the admin dashboard at:`);
    console.log(`https://braininspirednetwork.cloud/admin/dashboard`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

makeAdmin();
