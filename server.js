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
const budgetRoutes = require("./routes/budget_types.routes");
const freelancer_profile = require("./routes/freelancer.routes")
const skills = require("./routes/skill.routes")
const { getCurrentEnvironment, getEnvironmentConfig } = require("./config/environments");
const createOrUpdateAdmin = require("./utils/createAdmin");
const initializeProjectOptions = require("./utils/initializeProjectOptions");
const logger = require("./utils/logger");

const app = express();
const config = getEnvironmentConfig();
const PORT = config.app.port;

// Basic middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://venejob.com",
        "https://www.venejob.com",
        "https://app.venejob.com",
        "http://localhost:3000",
        "http://localhost:5173",
      ];

      // allow undefined origin (Postman, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // Allow Vercel preview URLs: *.vercel.app
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Allow from static list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS: " + origin), false);
    },
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(getCurrentEnvironment() === "development" ? "dev" : "combined"));
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/lookup", lookupRoutes);
app.use("/api/lookup/project-options", projectOptionsRoutes);
app.use("/api/lookup/budget-types", budgetRoutes);
app.use("/api/freelancer", freelancer_profile);
app.use("/api/skills", skills);

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
    logger.info("Database connected");

    const env = getCurrentEnvironment();

    if (env === "development") {
      logger.info("Running migrations (development)");
      const { execSync } = require("child_process");
      execSync("npx sequelize-cli db:migrate", { stdio: "inherit" });
      execSync("npx sequelize-cli db:seed:all", { stdio: "inherit" });
    }

    if (env === "test") {
      logger.info("Test environment detected – running migrations + seeds");
      const { execSync } = require("child_process");
      execSync("npx sequelize-cli db:migrate --env test", { stdio: "inherit" });
      execSync("npx sequelize-cli db:seed:all --env test", { stdio: "inherit" });
    }

    if (env === "production") {
      logger.info("Production mode: DB safe (manual migrations only)");
    }

    // Runs in ALL environments
    await createOrUpdateAdmin();
    await initializeProjectOptions();

    app.listen(PORT, () => {
      logger.info("Venejob Backend Server started", {
        environment: env,
        port: PORT,
        database: config.db.database,
      });
    });

  } catch (err) {
    logger.error("Startup error", err);
    process.exit(1);
  }
})();

