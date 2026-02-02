const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Only run on Vercel
if (!process.env.VERCEL) {
  console.log('Not running on Vercel. Skipping schema modification.');
  process.exit(0);
}

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

try {
  let schema = fs.readFileSync(schemaPath, 'utf8');

  // Check if we are using SQLite and switch to PostgreSQL for Vercel
  if (schema.includes('provider = "sqlite"')) {
    console.log('Detected SQLite provider on Vercel. Switching to PostgreSQL...');

    // Validate Environment Variables
    const hasPrismaUrl = !!process.env.POSTGRES_PRISMA_URL;
    const hasNonPoolingUrl = !!process.env.POSTGRES_URL_NON_POOLING;
    const hasStandardUrl = !!process.env.POSTGRES_URL;
    const hasDatabaseUrl = !!process.env.DATABASE_URL;

    let urlEnvVar = 'POSTGRES_PRISMA_URL';
    let directUrlEnvVar = 'POSTGRES_URL_NON_POOLING';

    if (!hasPrismaUrl || !hasNonPoolingUrl) {
      console.warn('⚠️  Standard Vercel Postgres environment variables (POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING) not found.');
      
      if (hasStandardUrl) {
        console.log('ℹ️  Found POSTGRES_URL. Using it for both pooled and direct connections.');
        urlEnvVar = 'POSTGRES_URL';
        directUrlEnvVar = 'POSTGRES_URL';
      } else if (hasDatabaseUrl && process.env.DATABASE_URL.startsWith('postgres')) {
        console.log('ℹ️  Found DATABASE_URL (Postgres). Using it.');
        urlEnvVar = 'DATABASE_URL';
        directUrlEnvVar = 'DATABASE_URL';
      } else {
        console.error('\n❌ CRITICAL ERROR: No PostgreSQL connection string found in environment variables.');
        console.error('   Please go to Vercel Dashboard -> Storage -> Create (or Select) Postgres Database.');
        console.error('   Then click "Connect Project" to link it to this environment.\n');
        process.exit(1);
      }
    }
    
    // Replace provider
    schema = schema.replace(
      'provider = "sqlite"',
      'provider = "postgresql"'
    );
    
    // Replace URL with determined environment variables
    if (schema.includes('url      = env("DATABASE_URL")')) {
       schema = schema.replace(
        'url      = env("DATABASE_URL")',
        `url      = env("${urlEnvVar}")\n  directUrl = env("${directUrlEnvVar}")`
      );
    }

    fs.writeFileSync(schemaPath, schema);
    console.log(`Successfully updated prisma/schema.prisma for PostgreSQL using ${urlEnvVar}.`);
    
    // Push database schema
    console.log('Running prisma db push...');
    try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('Database schema pushed successfully.');
    } catch (e) {
        console.error('Failed to push database schema. Ensure Vercel Postgres is connected.', e);
        process.exit(1);
    }

  } else {
    console.log('prisma/schema.prisma is not using SQLite. Skipping modification.');
  }
} catch (error) {
  console.error('Error modifying schema.prisma:', error);
  process.exit(1);
}
