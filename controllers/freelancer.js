const FreelancerService = require("../services/freelancer.service");

const saveProfile = async (req, res) => {
    try {
        await FreelancerService.saveFreelancerProfile(
            req.user.id,
            req.body
        );

        return res.json({
            success: true,
            message: "Profile saved successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        await FreelancerService.updateBasicProfile(
            req.user.id,
            req.body
        );

        return res.json({
            success: true,
            message: "Basic profile updated successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateSkills = async (req, res) => {
    try {
        await FreelancerService.updateSkills(
            req.user.id,
            req.body.skills
        );

        return res.json({
            success: true,
            message: "Skills updated successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateExperiences = async (req, res) => {
    try {
        await FreelancerService.updateExperiences(
            req.user.id,
            req.body.experiences
        );

        return res.json({
            success: true,
            message: "Experiences updated successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateEducations = async (req, res) => {
    try {
        await FreelancerService.updateEducations(
            req.user.id,
            req.body.educations
        );

        return res.json({
            success: true,
            message: "Educations updated successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateLanguages = async (req, res) => {
    try {
        await FreelancerService.updateLanguages(
            req.user.id,
            req.body.languages
        );

        return res.json({
            success: true,
            message: "Languages updated successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updatePortfolios = async (req, res) => {
    try {
        await FreelancerService.updatePortfolios(
            req.user.id,
            req.body.portfolios
        );

        return res.json({
            success: true,
            message: "Portfolios updated successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await FreelancerService.getProfile(
            req.user.id
        );

        return res.json({
            success: true,
            data: profile
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    saveProfile,
    updateProfile,
    updateSkills,
    updateExperiences,
    updateEducations,
    updateLanguages,
    updatePortfolios,
    getProfile
};
