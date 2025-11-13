const {
    projectSizes,
    durations,
    experienceLevels
} = require("../constants/projectOptions");

module.exports = {
    getProjectOptions: (req, res) => {
        return res.json({
            success: true,
            data: {
                projectSizes,
                durations,
                experienceLevels
            }
        });
    }
};
