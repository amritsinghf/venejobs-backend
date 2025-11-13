const JobService = require("../services/job.service");

module.exports = {
    createJob: async (req, res) => {
        try {
            const userId = req.user.id;
            const payload = req.body;

            const job = await JobService.createJob(userId, payload);

            res.status(201).json({
                success: true,
                message: "Job posted successfully.",
                job
            });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    }
};
