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
    
    // Replace provider
    schema = schema.replace(
      'provider = "sqlite"',
      'provider = "postgresql"'
    );
    
    // Replace URL with Vercel Postgres environment variables
    if (schema.includes('url      = env("DATABASE_URL")')) {
       schema = schema.replace(
        'url      = env("DATABASE_URL")',
        'url      = env("POSTGRES_PRISMA_URL")\n  directUrl = env("POSTGRES_URL_NON_POOLING")'
      );
    }

    fs.writeFileSync(schemaPath, schema);
    console.log('Successfully updated prisma/schema.prisma for PostgreSQL.');
    
    // Push database schema
    console.log('Running prisma db push...');
    try {
        execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        console.log('Database schema pushed successfully.');
    } catch (e) {
        console.error('Failed to push database schema. Ensure Vercel Postgres is connected.', e);
        // We don't exit here to allow build to try to proceed, or maybe we should fail?
        // If DB is not connected, the app won't work. But maybe user just wants to build frontend?
        // Let's fail hard to warn user.
        process.exit(1);
    }

  } else {
    console.log('prisma/schema.prisma is not using SQLite. Skipping modification.');
  }
} catch (error) {
  console.error('Error modifying schema.prisma:', error);
  process.exit(1);
}
