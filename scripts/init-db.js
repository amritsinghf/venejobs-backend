const { Client } = require('pg');
require('dotenv').config();

async function initializeDatabase(environment = 'development') {
  console.log(`🚀 Initializing ${environment} database...`);

  const config = getConfig(environment);
  
  try {
    // Connect to PostgreSQL default database
    const client = new Client({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: 'postgres'
    });

    await client.connect();
    console.log(`✅ Connected to PostgreSQL as ${config.db.user}`);

    // Check if database exists
    const dbCheck = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [config.db.database]
    );

    if (dbCheck.rows.length === 0) {
      await client.query(`CREATE DATABASE ${config.db.database}`);
      console.log(`✅ Database '${config.db.database}' created successfully`);
    } else {
      console.log(`ℹ️ Database '${config.db.database}' already exists`);
    }

    await client.end();

    // Now connect to the new database and create tables
    const dbClient = new Client({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database
    });

    await dbClient.connect();
    console.log(`✅ Connected to database '${config.db.database}'`);

    // Create users table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    `;

    await dbClient.query(createTableQuery);
    console.log(`✅ Users table created in '${config.db.database}'`);

    await dbClient.end();
    console.log(`🎉 ${environment} database setup completed successfully!`);

  } catch (error) {
    console.error(`❌ ${environment} database initialization failed:`, error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your PostgreSQL credentials in .env file');
    console.log('3. Default PostgreSQL credentials are usually:');
    console.log('   - Username: postgres');
    console.log('   - Password: postgres (or your custom password)');
  }
}

function getConfig(environment) {
  const configs = {
    development: {
      db: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'venejob_development',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
      }
    },
    production: {
      db: {
        host: process.env.PROD_DB_HOST || 'localhost',
        port: process.env.PROD_DB_PORT || 5432,
        database: process.env.PROD_DB_NAME || 'venejob_production',
        user: process.env.PROD_DB_USER || 'postgres',
        password: process.env.PROD_DB_PASSWORD || 'postgres'
      }
    },
    test: {
      db: {
        host: process.env.TEST_DB_HOST || 'localhost',
        port: process.env.TEST_DB_PORT || 5432,
        database: process.env.TEST_DB_NAME || 'venejob_test',
        user: process.env.TEST_DB_USER || 'postgres',
        password: process.env.TEST_DB_PASSWORD || 'postgres'
      }
    }
  };

  return configs[environment] || configs.development;
}

// Run initialization if script is executed directly
if (require.main === module) {
  const environment = process.argv[2] || 'development';
  initializeDatabase(environment);
}

module.exports = initializeDatabase;