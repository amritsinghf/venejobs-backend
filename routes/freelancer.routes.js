const router = require("express").Router();
const FreelancerController = require("../controllers/freelancer.controller");
const adminOrFreelancer = require("../middleware/adminOrFreelancer");
const { authenticateToken } = require("../middleware/auth");
const validateFreelancerProfile = require("../middleware/validateFreelancerProfile");

router.post("/profile", authenticateToken, validateFreelancerProfile, adminOrFreelancer, FreelancerController.saveProfile);
router.get("/profile", authenticateToken, adminOrFreelancer, FreelancerController.getProfile);
router.patch("/profile", authenticateToken, adminOrFreelancer, FreelancerController.updateProfile)

module.exports = router;
