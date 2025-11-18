const { Job } = require("../models");
const JOB_MESSAGES = require("../commonMessages/jobResponseMessages");
const { User } = require("../models");

function validateBusinessRules(data) {

    if (!Array.isArray(data.skills)) {
        throw new Error(JOB_MESSAGES.SKILLS_NOT_ARRAY);
    }

    if (data.skills.length === 0) {
        throw new Error(JOB_MESSAGES.SKILLS_EMPTY);
    }

    if (data.skills.length > 15) {
        throw new Error(JOB_MESSAGES.SKILLS_TOO_MANY);
    }

    if (!["hourly", "fixed", "monthly"].includes(data.budget_type)) {
        throw new Error(JOB_MESSAGES.INVALID_BUDGET_TYPE);
    }

    if (!data.budget_amount || data.budget_amount < 1) {
        throw new Error(JOB_MESSAGES.INVALID_BUDGET_AMOUNT);
    }

    if (data.budget_type === "hourly" && data.budget_amount < 5) {
        throw new Error(JOB_MESSAGES.HOURLY_MINIMUM);
    }

    if (data.budget_type === "monthly" && data.budget_amount < 300) {
        throw new Error(JOB_MESSAGES.MONTHLY_MINIMUM);
    }

    const validSizes = ["small", "medium", "large"];
    if (!validSizes.includes(data.project_size.toLowerCase().trim())) {
        throw new Error(JOB_MESSAGES.INVALID_PROJECT_SIZE);
    }

    if (data.project_size === "large" && data.duration === "1_2_days") {
        throw new Error(JOB_MESSAGES.LARGE_PROJECT_SHORT_DURATION);
    }

    const validDurations = [
        "1_2_days",
        "1_4_weeks",
        "1_3_months",
        "3_6_months",
        "ongoing"
    ];

    if (!validDurations.includes(data.duration)) {
        throw new Error(JOB_MESSAGES.INVALID_DURATION);
    }

    const validExperience = ["entry", "intermediate", "expert"];
    if (!validExperience.includes(data.experience_level.toLowerCase().trim())) {
        throw new Error(JOB_MESSAGES.INVALID_EXPERIENCE);
    }

    if (data.title.trim().length < 5) {
        throw new Error(JOB_MESSAGES.TITLE_TOO_SHORT);
    }

    if (data.description.trim().length < 20) {
        throw new Error(JOB_MESSAGES.DESCRIPTION_TOO_SHORT);
    }
}


async function createJob(userId, data) {

    validateBusinessRules(data);

    delete data.status;
    delete data.is_active;

    const job = await Job.create({
        client_id: userId,
        status: "published",
        is_active: true,
        ...data
    });

    return job;
}

async function updateJobStatus(jobId, status, userId) {

    const allowedStatuses = ["draft", "published", "paused", "closed"];

    if (!allowedStatuses.includes(status)) {
        throw new Error(JOB_MESSAGES.INVALID_STATUS);
    }

    const job = await Job.findOne({
        where: { id: jobId, client_id: userId }
    });

    if (!job) {
        throw new Error(JOB_MESSAGES.NOT_FOUND_OR_UNAUTHORIZED);
    }

    job.status = status;
    await job.save();

    return job;
}
async function updateActiveStatus(jobId, is_active, userId) {

    if (typeof is_active !== "boolean") {
        throw new Error(JOB_MESSAGES.ACTIVE_BOOL_ONLY);
    }

    const job = await Job.findOne({
        where: { id: jobId, client_id: userId }
    });

    if (!job) {
        throw new Error(JOB_MESSAGES.NOT_FOUND_OR_UNAUTHORIZED);
    }

    job.is_active = is_active;
    await job.save();

    return job;
}

async function getJobById(jobId) {
    const job = await Job.findOne({
        where: { id: jobId },
        include: [
            {
                model: User,
                as: "client",
                attributes: ["id", "name", "email"]
            }
        ]
    });

    if (!job) {
        throw new Error("Job not found");
    }

    return job;
}
async function getJobsByUser(userId) {
    const jobs = await Job.findAll({
        where: { client_id: userId },
        order: [["created_at", "DESC"]]
    });

    return jobs;
}
async function updateJob(jobId, userId, payload) {
    const job = await Job.findOne({ where: { id: jobId, client_id: userId } });

    if (!job) {
        throw new Error("Job not found or you are not authorized to update this job.");
    }

    await job.update(payload);
    return job;
}

module.exports = {
    createJob,
    updateJobStatus,
    updateActiveStatus,
    getJobById,
    getJobsByUser,
    updateJob
};
