require("dotenv").config();
const { Client } = require("pg");
const { execSync } = require("child_process");

async function initializeDatabase(env = "development") {
  console.log(`Setting up database for: ${env}`);

  const config = getConfig(env);

  try {
    // Connect to default postgres database
    const client = new Client({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: "postgres",
    });

    await client.connect();

    // Check if database exists
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.db.database]
    );

    if (dbCheck.rows.length === 0) {
      await client.query(`CREATE DATABASE ${config.db.database}`);
      console.log(`Database created: ${config.db.database}`);
    } else {
      console.log(`Database exists: ${config.db.database}`);
    }

    await client.end();

    // Run migrations
    console.log("Running migrations...");
    execSync(`npx sequelize-cli db:migrate --env ${env}`, { stdio: "inherit" });

    // Run seeders
    try {
      console.log("Running seeders...");
      execSync(`npx sequelize-cli db:seed:all --env ${env}`, {
        stdio: "inherit",
      });
    } catch {
      console.log("No seeders found.");
    }

    console.log(`Database setup completed for: ${env}`);
  } catch (err) {
    console.error("Database setup failed:", err.message);
  }
}

function getConfig(env) {
  const configs = {
    development: {
      db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      },
    },
    production: {
      db: {
        host: process.env.PROD_DB_HOST,
        port: process.env.PROD_DB_PORT,
        database: process.env.PROD_DB_NAME,
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_PASSWORD,
      },
    },
    test: {
      db: {
        host: process.env.TEST_DB_HOST,
        port: process.env.TEST_DB_PORT,
        database: process.env.TEST_DB_NAME,
        user: process.env.TEST_DB_USER,
        password: process.env.TEST_DB_PASSWORD,
      },
    },
  };

  return configs[env];
}

// CLI support
if (require.main === module) {
  const env = process.argv[2] || "development";
  initializeDatabase(env);
}

module.exports = initializeDatabase;
