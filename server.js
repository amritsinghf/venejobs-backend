const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/job.routes");
const lookupRoutes = require("./routes/lookup.routes");
const projectOptionsRoutes = require("./routes/projectOptions.routes");
const budgetRoutes = require("./routes/budgetOptions.routes");

const { getCurrentEnvironment, getEnvironmentConfig } = require("./config/environments");
const createOrUpdateAdmin = require("./utils/createAdmin");

const app = express();
const config = getEnvironmentConfig();
const PORT = config.app.port;

// Basic middlewares
app.use(helmet());
app.use(
    cors({
        origin:
            getCurrentEnvironment() === "production"
                ? ["https://venejob.com", "https://www.venejob.com", "https://app.venejob.com"]
                : ["http://localhost:3000", "http://localhost:5173"],
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(getCurrentEnvironment() === "development" ? "dev" : "combined"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/lookup", lookupRoutes);
app.use("/api/lookup/project-options", projectOptionsRoutes);
app.use("/api/lookup/budget-options", budgetRoutes);

// Default route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Venejob Backend API",
        version: "1.0.0",
        status: "operational",
    });
});

// App start + DB setup
(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected");

        const env = getCurrentEnvironment();

        if (env === "development") {
            console.log("🔧 Running migrations (dev only)...");
            const { execSync } = require("child_process");
            execSync("npx sequelize-cli db:migrate", { stdio: "inherit" });
            execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
        }

        if (env === "test") {
            console.log("🧪 Test env → resetting DB...");
            const { execSync } = require("child_process");
            execSync("npx sequelize-cli db:migrate:undo:all", { stdio: "inherit" });
            execSync("npx sequelize-cli db:migrate", { stdio: "inherit" });
            execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
        }

        if (env === "production") {
            console.log(`
⚠️ PRODUCTION MODE:
----------------------------------------
❌ Auto migrations disabled 
✔ Run migrations manually using:
   npx sequelize-cli db:migrate
----------------------------------------
`);
        }

        await createOrUpdateAdmin();

        app.listen(PORT, () => {
            console.log(`
============================================
        ✅ Venejob Backend Server Running
--------------------------------------------
🌍 Environment : ${getCurrentEnvironment()}
🚀 URL         : http://localhost:${PORT}
🗄️ Database    : ${config.db.database}
============================================
`);
        });

    } catch (err) {
        console.error("Startup error:", err);
        process.exit(1);
    }
})();
