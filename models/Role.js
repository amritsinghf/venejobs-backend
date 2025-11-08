const db = require('../config/database');
const { getCurrentEnvironment } = require('../config/environments');

class Role {
  static async createTable() {
    const queryText = `
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
    `;
    try {
      await db.query(queryText);
      console.log(`✅ Roles table ensured in ${getCurrentEnvironment()} database`);
    } catch (error) {
      console.error('❌ Error creating roles table:', error.message);
      throw error;
    }
  }

  static async seedRoles() {
    const defaultRoles = [
      { name: 'freelancer', description: 'User offering services' },
      { name: 'client', description: 'User posting jobs' },
      { name: 'admin', description: 'Platform administrator' }
    ];

    for (const role of defaultRoles) {
      await db.query(
        `INSERT INTO roles (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [role.name, role.description]
      );
    }
  }

  static async findByName(name) {
    const result = await db.query('SELECT * FROM roles WHERE name = $1', [name]);
    return result.rows[0];
  }
}

module.exports = Role;
