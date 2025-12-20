const FreelancerService = require("../services/freelancer.service");

const saveProfile = async (req, res) => {
    try {
        await FreelancerService.saveFreelancerProfile(
            req.user.id,
            req.body
        );

        res.json({
            success: true,
            message: "Profile saved successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        await FreelancerService.updateProfile(
            req.user.id,
            req.body
        );

        res.json({
            success: true,
            message: "Profile updated successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await FreelancerService.getProfile(req.user.id);
        res.json({
            success: true,
            data: profile
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    saveProfile,
    updateProfile,
    getProfile
};
