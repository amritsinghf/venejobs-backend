const { Job } = require("../models");

class JobService {

    static validateBusinessRules(data) {

        if (!Array.isArray(data.skills)) {
            throw new Error("Skills must be an array.");
        }

        if (data.skills.length === 0) {
            throw new Error("Please select at least 1 skill.");
        }

        if (data.skills.length > 15) {
            throw new Error("You can select a maximum of 15 skills.");
        }

        if (!["hourly", "fixed", "monthly"].includes(data.budget_type)) {
            throw new Error("Budget type must be hourly, fixed, or monthly.");
        }

        if (!data.budget_amount || data.budget_amount < 1) {
            throw new Error("Budget amount must be greater than 0.");
        }

        if (data.budget_type === "hourly" && data.budget_amount < 5) {
            throw new Error("Hourly rate must be at least $5.");
        }

        if (data.budget_type === "monthly" && data.budget_amount < 300) {
            throw new Error("Monthly rate must be at least $300.");
        }

        if (!["Small", "Medium", "Large"].includes(data.project_size)) {
            throw new Error("Invalid project size.");
        }

        if (data.project_size === "Large" && data.duration === "1–2 Days") {
            throw new Error("Large projects cannot be 1–2 days.");
        }

        const validDurations = [
            "1_2_days",
            "1_4_weeks",
            "1_3_months",
            "3_6_months",
            "ongoing"
        ];

        if (!validDurations.includes(data.duration)) {
            throw new Error("Invalid project duration.");
        }

        if (!["Entry", "Intermediate", "Expert"].includes(data.experience_level)) {
            throw new Error("Invalid experience level.");
        }

        if (data.title.trim().length < 5) {
            throw new Error("Job title must be at least 5 characters.");
        }

        if (data.description.trim().length < 20) {
            throw new Error("Description must be at least 20 characters.");
        }
    }

    // CREATE JOB
    static async createJob(userId, data) {
        this.validateBusinessRules(data);

        return await Job.create({
            client_id: userId,
            status: "published",
            ...data
        });
    }
}

module.exports = JobService;
