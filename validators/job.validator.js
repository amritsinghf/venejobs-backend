const { body } = require("express-validator");

const createJobValidator = [
    body("title")
        .trim()
        .notEmpty().withMessage("Job title is required")
        .isLength({ min: 5 }).withMessage("Title must be at least 5 characters"),

    body("category")
        .notEmpty().withMessage("Category is required"),

    body("skills")
        .isArray({ min: 1 }).withMessage("At least 1 skill is required"),

    body("project_size")
        .isIn(["Small", "Medium", "Large"])
        .withMessage("Project size must be Small, Medium, or Large"),

    body("duration")
        .notEmpty().withMessage("Duration is required"),

    body("experience_level")
        .isIn(["Entry", "Intermediate", "Expert"])
        .withMessage("Experience level is invalid"),

    body("budget_type")
        .isIn(["hourly", "fixed", "monthly"])
        .withMessage("Budget type is invalid"),

    body("budget_amount")
        .isFloat({ min: 1 })
        .withMessage("Budget must be greater than 0"),

    body("description")
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),

    (req, res, next) => {
        const { validationResult } = require("express-validator");
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];

module.exports = createJobValidator