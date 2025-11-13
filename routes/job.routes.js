const express = require("express");
const router = express.Router();
const JobController = require("../controllers/job.controller");
const createJobValidator = require("../validators/job.validator");
const { authenticateToken } = require("../middleware/auth");

router.post("/", authenticateToken, createJobValidator, JobController.createJob);
router.patch("/:id/status", authenticateToken, JobController.updateStatus);
router.patch("/:id/active", authenticateToken, JobController.updateActive);

module.exports = router;
