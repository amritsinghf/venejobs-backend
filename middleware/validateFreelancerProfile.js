module.exports = (req, res, next) => {
    const body = req.body;

    const requiredRootFields = [
        "professional_title",
        "overview",
        "hourly_rate",
        "date_of_birth",
        "street_address",
        // "apt_suite",
        "city",
        "country",
        "zip_code",
        // "phone",
        "skills",
        "experiences",
        "educations",
        "languages",
        "portfolios"
    ];

    // root level check
    for (const field of requiredRootFields) {
        if (
            body[field] === undefined ||
            body[field] === null ||
            body[field] === ""
        ) {
            return res.status(400).json({
                message: `${field} is required`
            });
        }
    }

    // skills
    if (!Array.isArray(body.skills) || body.skills.length === 0) {
        return res.status(400).json({ message: "skills must be a non-empty array" });
    }

    // experiences
    for (const exp of body.experiences) {
        const requiredExpFields = [
            "job_title",
            "company",
            "location",
            "city",
            "start_month",
            "start_year",
            "end_month",
            "end_year",
            "is_current",
            "description"
        ];

        for (const field of requiredExpFields) {
            if (exp[field] === undefined) {
                return res.status(400).json({
                    message: `experience.${field} is required`
                });
            }
        }
    }

    // educations
    for (const edu of body.educations) {
        const requiredEduFields = [
            "institution_name",
            "degree",
            "field_of_study",
            "type_of_education",
            "start_date",
            "end_date",
            "description"
        ];

        for (const field of requiredEduFields) {
            if (!edu[field]) {
                return res.status(400).json({
                    message: `education.${field} is required`
                });
            }
        }
    }

    // languages
    for (const lang of body.languages) {
        if (!lang.language || !lang.proficiency) {
            return res.status(400).json({
                message: "language and proficiency are required"
            });
        }
    }

    // portfolios
    for (const port of body.portfolios) {
        if (!port.title || !port.project_url) {
            return res.status(400).json({
                message: "portfolio title and project_url are required"
            });
        }
    }

    next();
};
