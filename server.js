// app.js or server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { getCurrentEnvironment, getEnvironmentConfig } = require('./config/environments');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/User');
const Role = require('./models/Role');

const app = express();
const config = getEnvironmentConfig();
const PORT = config.app.port;

// ---------------------------
// Middleware
// ---------------------------
app.use(helmet());
app.use(cors({
    origin: getCurrentEnvironment() === 'production'
        ? ['https://venejob.com', 'https://www.venejob.com', 'https://app.venejob.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(morgan(getCurrentEnvironment() === 'development' ? 'dev' : 'combined'));

// ---------------------------
// Routes
// ---------------------------
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Venejob Backend API',
        version: '1.0.0',
        status: 'operational'
    });
});

// ---------------------------
// Initialize DB + Admin User
// ---------------------------
(async () => {
    try {
        // 1️⃣ Ensure roles table + default roles
        await Role.createTable();
        await Role.seedRoles();

        // 2️⃣ Ensure users table exists
        await User.createTable();

        // 3️⃣ Sync any new columns in users table
        await User.syncColumns();

        // 4️⃣ Create or update admin user automatically
        await User.createOrUpdateAdmin();

        // 5️⃣ Start the server
        app.listen(PORT, () => {
            console.log(`
✅ Venejob Backend Running
---------------------------
🌍 Env: ${getCurrentEnvironment()}
🚀 URL: http://localhost:${PORT}
🗄️  DB: ${config.db.database}
📊 Version: 1.0.0
`);
        });
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
})();

