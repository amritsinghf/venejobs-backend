const router = require("express").Router();
const FreelancerController = require("../controllers/freelancer");
const adminOrFreelancer = require("../middleware/adminOrFreelancer");
const { authenticateToken } = require("../middleware/auth");
const validateFreelancerProfile = require("../middleware/validateFreelancerProfile");

router.post(
    "/profile",
    authenticateToken,
    validateFreelancerProfile,
    adminOrFreelancer,
    FreelancerController.saveProfile
);

router.get(
    "/profile",
    authenticateToken,
    adminOrFreelancer,
    FreelancerController.getProfile
);

router.patch("/profile/basic", authenticateToken, adminOrFreelancer, FreelancerController.updateProfile);
router.put("/profile/skills", authenticateToken, adminOrFreelancer, FreelancerController.updateSkills);
router.put("/profile/experiences", authenticateToken, adminOrFreelancer, FreelancerController.updateExperiences);
router.put("/profile/educations", authenticateToken, adminOrFreelancer, FreelancerController.updateEducations);
router.put("/profile/languages", authenticateToken, adminOrFreelancer, FreelancerController.updateLanguages);
router.put("/profile/portfolios", authenticateToken, adminOrFreelancer, FreelancerController.updatePortfolios);


module.exports = router;
