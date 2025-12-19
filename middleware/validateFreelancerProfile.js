const ERRORS = require("../commonMessages/freelancerProfileMessages");

const isEmpty = (value) =>
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

const sendError = (res, error) => {
    return res.status(400).json({
        success: false,
        error: {
            code: error.code,
            message: error.message
        }
    });
};

const validateFreelancerProfile = (req, res, next) => {
    const {
        professional_title,
        overview,
        hourly_rate,
        country,
        city,
        skills,
        experiences,
        educations,
        languages,
        portfolios
    } = req.body;

    if (isEmpty(professional_title)) return sendError(res, ERRORS.PROFILE_TITLE_REQUIRED);
    if (isEmpty(overview)) return sendError(res, ERRORS.PROFILE_OVERVIEW_REQUIRED);
    if (isEmpty(country)) return sendError(res, ERRORS.PROFILE_COUNTRY_REQUIRED);
    if (isEmpty(city)) return sendError(res, ERRORS.PROFILE_CITY_REQUIRED);

    if (isEmpty(hourly_rate) || typeof hourly_rate !== "number") {
        return sendError(res, ERRORS.PROFILE_RATE_REQUIRED);
    }

    if (!Array.isArray(skills) || skills.length === 0) {
        return sendError(res, ERRORS.PROFILE_SKILLS_REQUIRED);
    }
    if (!Array.isArray(experiences) || experiences.length === 0) {
        return sendError(res, ERRORS.PROFILE_EXPERIENCES_REQUIRED);
    }
    if (!Array.isArray(educations) || educations.length === 0) {
        return sendError(res, ERRORS.PROFILE_EDUCATIONS_REQUIRED);
    }
    if (!Array.isArray(languages) || languages.length === 0) {
        return sendError(res, ERRORS.PROFILE_LANGUAGES_REQUIRED);
    }
    if (!Array.isArray(portfolios) || portfolios.length === 0) {
        return sendError(res, ERRORS.PROFILE_PORTFOLIOS_REQUIRED);
    }

    for (const exp of experiences) {
        if (
            isEmpty(exp.job_title) ||
            isEmpty(exp.company) ||
            typeof exp.is_current !== "boolean"
        ) {
            return sendError(res, ERRORS.PROFILE_EXPERIENCE_INVALID);
        }
    }

    for (const edu of educations) {
        if (
            isEmpty(edu.institution_name) ||
            isEmpty(edu.degree) ||
            isEmpty(edu.field_of_study)
        ) {
            return sendError(res, ERRORS.PROFILE_EDUCATION_INVALID);
        }
    }

    for (const lang of languages) {
        if (isEmpty(lang.language) || isEmpty(lang.proficiency)) {
            return sendError(res, ERRORS.PROFILE_LANGUAGE_INVALID);
        }
    }

    for (const port of portfolios) {
        if (isEmpty(port.title) || isEmpty(port.image_url)) {
            return sendError(res, ERRORS.PROFILE_PORTFOLIO_INVALID);
        }
    }

    next();
};

module.exports = validateFreelancerProfile;
