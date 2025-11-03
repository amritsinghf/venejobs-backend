const { Pool } = require('pg');
const { getEnvironmentConfig, getCurrentEnvironment } = require('./environments');
require('dotenv').config();

class Database {
  constructor() {
    this.config = getEnvironmentConfig();
    this.pool = this.createPool();
    this.testConnection();
  }

  createPool() {
    const dbConfig = this.config.db;
    
    console.log(`🔧 Connecting to ${getCurrentEnvironment()} database: ${dbConfig.database}`);
    
    return new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      password: dbConfig.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async testConnection() {
    try {
      const client = await this.pool.connect();
      console.log(`✅ PostgreSQL connected successfully to ${this.config.db.database}`);
      client.release();
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('💡 Run: npm run init-db:' + getCurrentEnvironment());
      process.exit(1);
    }
  }

  async query(text, params) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.log(`🐌 Slow query executed in ${duration}ms:`, text);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', error.message);
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

// Create database instance
const database = new Database();

module.exports = database;