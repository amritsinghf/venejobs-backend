const express = require("express");
const router = express.Router();
const JobController = require("../controllers/job.controller");
const createJobValidator = require("../validators/job.validator");
const { authenticateToken } = require("../middleware/auth");
console.log("AUTH =>", typeof auth);
console.log("VALIDATOR =>", typeof createJobValidator);
console.log("CONTROLLER =>", typeof JobController.createJob);
router.post("/", authenticateToken , createJobValidator, JobController.createJob);

module.exports = router;
