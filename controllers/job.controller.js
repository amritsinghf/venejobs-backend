const JobService = require("../services/job.service");

module.exports = {
    createJob: async (req, res) => {
        try {
            const userId = req.user.id;
            const payload = req.body;

            const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

            const job = await JobService.createJob(userId, {
                ...payload,
                attachment: attachmentUrl
            });

            res.status(201).json({
                success: true,
                message: "Job posted successfully.",
                job
            });
        } catch (err) {
            res.status(400).json({ success: false, message: err.message });
        }
    },
    updateStatus: async (req, res) => {
        try {
            const jobId = req.params.id;
            const { status } = req.body;
            const userId = req.user.id;

            const job = await JobService.updateJobStatus(jobId, status, userId);

            res.json({
                success: true,
                message: "Job status updated successfully",
                job
            });

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },

    updateActive: async (req, res) => {
        try {
            const jobId = req.params.id;
            const { is_active } = req.body;
            const userId = req.user.id;

            const job = await JobService.updateActiveStatus(jobId, is_active, userId);

            res.json({
                success: true,
                message: "Job active status updated successfully",
                job
            });

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    },
    getJobDetailsById: async (req, res) => {
        try {
            const jobId = req.params.id;

            const job = await JobService.getJobById(jobId);

            return res.status(200).json({
                success: true,
                job
            });

        } catch (error) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
    },
    getUserJobs: async (req, res) => {
        try {
            const userId = req.user.id;

            const jobs = await JobService.getJobsByUser(userId);

            return res.status(200).json({
                success: true,
                count: jobs.length,
                jobs
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

};
