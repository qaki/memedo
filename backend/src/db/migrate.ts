import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in the .env file.');
    process.exit(1);
  }

  console.log('🚀 Running database migration using Drizzle migrator...\n');

  try {
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder: './src/db/migrations' });

    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Verifying tables...\n');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log('📋 Tables created:');
    tables.forEach((table: any) => {
      console.log(`   ✓ ${table.table_name}`);
    });

    console.log('\n🎉 Database migration PASSED!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

