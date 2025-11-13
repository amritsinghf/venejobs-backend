const express = require("express");
const router = express.Router();
const JobController = require("../controllers/job.controller");
const createJobValidator = require("../validators/job.validator");
const { authenticateToken } = require("../middleware/auth");
const { upload } = require("../utils/upload");
router.post(
    "/create",
    authenticateToken,
    upload.single("attachment"),
    createJobValidator,
    JobController.createJob
);
router.patch("/:id/status", authenticateToken, JobController.updateStatus);
router.patch("/:id/active", authenticateToken, JobController.updateActive);
router.get(
    "/my-jobs",
    authenticateToken,
    JobController.getUserJobs
);

router.get(
    "/:id",
    authenticateToken,
    JobController.getJobDetailsById
);
module.exports = router;
