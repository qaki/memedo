/**
 * Database connection test script
 * Run this after setting up your Neon PostgreSQL database
 * 
 * Usage: pnpm run db:test
 */
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Neon PostgreSQL connection...\n');

  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not set in .env file');
    console.log('\nPlease follow these steps:');
    console.log('1. Create a Neon database at https://neon.tech');
    console.log('2. Copy your connection string');
    console.log('3. Update backend/.env with DATABASE_URL=your-connection-string');
    console.log('\nSee docs/neon-setup-guide.md for detailed instructions.');
    process.exit(1);
  }

  // Mask the password in the URL for logging
  const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
  console.log(`📡 Connecting to: ${maskedUrl}\n`);

  try {
    // Create SQL client
    const sql = neon(databaseUrl);

    // Test 1: Basic query
    console.log('Test 1: Running basic query...');
    const result = await sql`SELECT version(), current_database(), current_user`;
    console.log('✅ Connection successful!');
    console.log(`   PostgreSQL version: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);
    console.log(`   Database: ${result[0].current_database}`);
    console.log(`   User: ${result[0].current_user}\n`);

    // Test 2: Check tables
    console.log('Test 2: Checking existing tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tables.length === 0) {
      console.log('ℹ️  No tables found yet (expected for fresh database)');
      console.log('   Tables will be created when you run migrations (Story 1.7)\n');
    } else {
      console.log(`✅ Found ${tables.length} table(s):`);
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
      console.log();
    }

    // Test 3: Check permissions
    console.log('Test 3: Checking database permissions...');
    const permissions = await sql`
      SELECT 
        has_database_privilege(current_database(), 'CREATE') as can_create,
        has_database_privilege(current_database(), 'CONNECT') as can_connect
    `;
    console.log(`✅ Permissions:`);
    console.log(`   CREATE: ${permissions[0].can_create ? '✅' : '❌'}`);
    console.log(`   CONNECT: ${permissions[0].can_connect ? '✅' : '❌'}\n`);

    // Success summary
    console.log('🎉 Database connection test PASSED!\n');
    console.log('Next steps:');
    console.log('  1. Run Story 1.6: Configure Drizzle ORM and define schema');
    console.log('  2. Run Story 1.7: Execute database migrations');
    console.log();

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection FAILED\n');
    console.error('Error details:');
    console.error(`   Message: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check if your IP is allowed in Neon dashboard');
      console.log('   - Verify sslmode=require is in the connection string');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Verify your connection string is correct');
      console.log('   - Check username and password in DATABASE_URL');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Verify the database name in your connection string');
      console.log('   - Check if the project exists in your Neon dashboard');
    }
    
    console.log('\nSee docs/neon-setup-guide.md for more help.');
    process.exit(1);
  }
}

// Run the test
testConnection();

