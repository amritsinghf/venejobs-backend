const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { getCurrentEnvironment } = require('../config/environments');
const Role = require('./Role');

class User {
    static async createTable() {
        const queryText = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        lastname VARCHAR(100),
        age INT CHECK (age > 0),
        phone VARCHAR(15),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role_id INT REFERENCES roles(id) ON DELETE SET NULL,
        is_email_verified BOOLEAN DEFAULT FALSE,
        email_verification_code VARCHAR(6),
        email_verification_expires_at TIMESTAMP,
        is_phone_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    `;
        await db.query(queryText);
        console.log(`✅ Users table ensured in ${getCurrentEnvironment()} database`);
    }

    static async createTokenTable() {
        const queryText = `
      CREATE TABLE IF NOT EXISTS user_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);
    `;
        await db.query(queryText);
        console.log('✅ user_tokens table ensured');
    }

    static async findByEmail(email) {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async findById(id) {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async update(id, updateData) {
        const fields = [];
        const values = [];
        let count = 1;

        for (const key in updateData) {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = $${count}`);
                values.push(updateData[key]);
                count++;
            }
        }

        if (fields.length === 0) throw new Error('No fields to update');
        fields.push(`updated_at = $${count}`);
        values.push(new Date());
        count++;

        const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${count}
      RETURNING id, name, email, role_id, is_email_verified, created_at, updated_at
    `;
        values.push(id);

        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async createOrUpdateAdmin() {
        const adminData = {
            name: process.env.ADMIN_NAME || 'Admin',
            lastname: process.env.ADMIN_LASTNAME || 'User',
            age: process.env.ADMIN_AGE ? parseInt(process.env.ADMIN_AGE, 10) : 30,
            phone: process.env.ADMIN_PHONE || '0000000000',
            email: process.env.ADMIN_EMAIL || 'admin@venejob.com',
            password: process.env.ADMIN_PASSWORD || 'Admin@123'
        };

        const adminRole = await Role.findByName('admin');
        if (!adminRole) throw new Error('Admin role not found.');

        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const existingAdmin = await this.findByEmail(adminData.email);

        if (existingAdmin) {
            await this.update(existingAdmin.id, {
                name: adminData.name,
                lastname: adminData.lastname,
                age: adminData.age,
                phone: adminData.phone,
                password: hashedPassword,
                role_id: adminRole.id
            });
            console.log(`🔄 Admin updated → ${adminData.email}`);
            return;
        }

        static async syncColumns() {
         const alterQueries = [
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;`,
`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TIMESTAMP;`,
            // Add more columns here if needed
        ];

        for (const query of alterQueries) {
            try {
                await db.query(query);
            } catch (error) {
                console.error('Error syncing column:', error.message);
            }
        }

         console.log('Users table synced (new columns ensured)');
        }

        await db.query(
            `INSERT INTO users (name, lastname, age, phone, email, password, role_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [adminData.name, adminData.lastname, adminData.age, adminData.phone, adminData.email, hashedPassword, adminRole.id]
        );
        console.log(`✅ Admin created → ${adminData.email}`);
    }
}

module.exports = User;
