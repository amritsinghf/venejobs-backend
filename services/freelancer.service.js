const freelancerProfileMessages = require("../commonMessages/freelancerProfileMessages");
const {
  sequelize,
  User,
  FreelancerProfile,
  FreelancerSkill,
  FreelancerExperience,
  FreelancerEducation,
  FreelancerLanguage,
  FreelancerPortfolio,
} = require("../models");

const ensureProfile = async (userId, payload, transaction) => {
  const [profile] = await FreelancerProfile.findOrCreate({
    where: { user_id: userId },
    defaults: {
      professional_title: payload.professional_title,
      overview: payload.overview,
      hourly_rate: payload.hourly_rate,
      country: payload.country,
      city: payload.city,
      profile_completed: false
    },
    transaction
  });

  return profile;
};

const saveFreelancerProfile = async (userId, payload) => {
  return sequelize.transaction(async (transaction) => {
    // =========================
    // USER
    // =========================
    await User.update(
      {
        phone: payload.phone,
        profile_picture: payload.profile_picture,
        date_of_birth: payload.date_of_birth,
        street_address: payload.street_address,
        apt_suite: payload.apt_suite,
        city: payload.city,
        state: payload.state,
        zip_code: payload.zip_code,
        country: payload.country
      },
      { where: { id: userId }, transaction }
    );

    // =========================
    // PROFILE
    // =========================
    const profile = await ensureProfile(userId, payload, transaction);

    await profile.update(
      {
        professional_title: payload.professional_title,
        overview: payload.overview,
        hourly_rate: payload.hourly_rate,
        profile_completed: true
      },
      { transaction }
    );

    const freelancerId = profile.id;

    // =========================
    // SKILLS
    // =========================
    await FreelancerSkill.destroy({
      where: { freelancer_id: freelancerId },
      transaction
    });

    if (payload.skills?.length) {
      await FreelancerSkill.bulkCreate(
        payload.skills.map((skill) => ({
          freelancer_id: freelancerId,
          skill_name: skill.name,
          level: skill.level || null
        })),
        { transaction }
      );
    }


    // =========================
    // EXPERIENCES (UPDATED)
    // =========================
    await FreelancerExperience.destroy({
      where: { freelancer_id: freelancerId },
      transaction
    });

    if (payload.experiences?.length) {
      await FreelancerExperience.bulkCreate(
        payload.experiences.map((exp) => ({
          freelancer_id: freelancerId,
          job_title: exp.job_title,
          company: exp.company,
          location: exp.location,
          city: exp.city,
          start_month: exp.start_month,
          start_year: exp.start_year,
          end_month: exp.end_month,
          end_year: exp.end_year,
          is_current: exp.is_current,
          description: exp.description
        })),
        { transaction }
      );
    }

    // =========================
    // EDUCATIONS (UPDATED)
    // =========================
    await FreelancerEducation.destroy({
      where: { freelancer_id: freelancerId },
      transaction
    });

    if (payload.educations?.length) {
      await FreelancerEducation.bulkCreate(
        payload.educations.map((edu) => ({
          freelancer_id: freelancerId,
          institution_name: edu.institution_name,
          degree: edu.degree,
          field_of_study: edu.field_of_study,
          type_of_education: edu.type_of_education,
          start_date: edu.start_date,
          end_date: edu.end_date,
          description: edu.description
        })),
        { transaction }
      );
    }

    // =========================
    // LANGUAGES
    // =========================
    await FreelancerLanguage.destroy({
      where: { freelancer_id: freelancerId },
      transaction
    });

    if (payload.languages?.length) {
      await FreelancerLanguage.bulkCreate(
        payload.languages.map((lang) => ({
          freelancer_id: freelancerId,
          language: lang.language,
          proficiency: lang.proficiency
        })),
        { transaction }
      );
    }

    // =========================
    // PORTFOLIOS
    // =========================
    await FreelancerPortfolio.destroy({
      where: { freelancer_id: freelancerId },
      transaction
    });

    if (payload.portfolios?.length) {
      await FreelancerPortfolio.bulkCreate(
        payload.portfolios.map((portfolio) => ({
          freelancer_id: freelancerId,
          title: portfolio.title,
          description: portfolio.description,
          project_url: portfolio.project_url
        })),
        { transaction }
      );
    }

    return profile;
  });
};

const updateBasicProfile = async (userId, payload) => {
  return sequelize.transaction(async (transaction) => {

    const userFields = [
      "phone",
      "profile_picture",
      "date_of_birth",
      "street_address",
      "apt_suite",
      "city",
      "state",
      "zip_code",
      "country"
    ];

    const userUpdate = {};
    userFields.forEach(field => {
      if (payload[field] !== undefined) {
        userUpdate[field] = payload[field];
      }
    });

    if (Object.keys(userUpdate).length) {
      await User.update(userUpdate, {
        where: { id: userId },
        transaction
      });
    }

    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const profileFields = ["professional_title", "overview", "hourly_rate"];
    const profileUpdate = {};

    profileFields.forEach(field => {
      if (payload[field] !== undefined) {
        profileUpdate[field] = payload[field];
      }
    });

    if (Object.keys(profileUpdate).length) {
      await profile.update(profileUpdate, { transaction });
    }

    return true;
  });
};

const updateSkills = async (userId, skills) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    await FreelancerSkill.destroy({
      where: { freelancer_id: profile.id },
      transaction
    });

    if (skills?.length) {
      await FreelancerSkill.bulkCreate(
        skills.map(skill => ({
          freelancer_id: profile.id,
          skill_name: skill.name,
          level: skill.level || null
        })),
        { transaction }
      );
    }
  });
};

const createExperience = async (userId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const existingExperience = await FreelancerExperience.findOne({
      where: {
        freelancer_id: profile.id,
        company: data.company,
        job_title: data.job_title,
        start_year: data.start_year,
        start_month: data.start_month
      },
      transaction
    });

    if (existingExperience) {
      throw new Error(
        "Experience already exists for this company and role."
      );
    }

    return FreelancerExperience.create(
      {
        freelancer_id: profile.id,
        job_title: data.job_title,
        company: data.company,
        location: data.location,
        city: data.city,
        start_month: data.start_month,
        start_year: data.start_year,
        end_month: data.end_month,
        end_year: data.end_year,
        is_current: data.is_current,
        description: data.description
      },
      { transaction }
    );
  });
};


const updateExperience = async (userId, experienceId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const experience = await FreelancerExperience.findOne({
      where: {
        id: experienceId,
        freelancer_id: profile.id
      },
      transaction
    });

    if (!experience) throw new Error("Experience not found");

    await experience.update(
      {
        job_title: data.job_title,
        company: data.company,
        location: data.location,
        city: data.city,
        start_month: data.start_month,
        start_year: data.start_year,
        end_month: data.end_month,
        end_year: data.end_year,
        is_current: data.is_current,
        description: data.description
      },
      { transaction }
    );
  });
};

const deleteExperience = async (userId, experienceId) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const deleted = await FreelancerExperience.destroy({
      where: {
        id: experienceId,
        freelancer_id: profile.id
      },
      transaction
    });

    if (!deleted) throw new Error("Experience not found");
  });
};

const createEducation = async (userId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) {
      const error = new Error("Profile not found");
      error.statusCode = 404;
      throw error;
    }

    try {
      return await FreelancerEducation.create(
        {
          freelancer_id: profile.id,
          institution_name: data.institution_name,
          degree: data.degree,
          field_of_study: data.field_of_study,
          type_of_education: data.type_of_education,
          start_date: data.start_date,
          end_date: data.end_date,
          description: data.description
        },
        { transaction }
      );
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        const error = new Error("Education already exists.");
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  });
};


const updateEducation = async (userId, educationId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const education = await FreelancerEducation.findOne({
      where: {
        id: educationId,
        freelancer_id: profile.id
      },
      transaction
    });

    if (!education) throw new Error("Education not found");

    await education.update(
      {
        institution_name: data.institution_name,
        degree: data.degree,
        field_of_study: data.field_of_study,
        type_of_education: data.type_of_education,
        start_date: data.start_date,
        end_date: data.end_date,
        description: data.description
      },
      { transaction }
    );
  });
};

const deleteEducation = async (userId, educationId) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const deleted = await FreelancerEducation.destroy({
      where: {
        id: educationId,
        freelancer_id: profile.id
      },
      transaction
    });

    if (!deleted) throw new Error("Education not found");
  });
};

const createLanguage = async (userId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const existingLanguage = await FreelancerLanguage.findOne({
      where: {
        freelancer_id: profile.id,
        language: data.language
      },
      transaction
    });

    if (existingLanguage) {
      throw new Error("Language already exists.");
    }

    return FreelancerLanguage.create(
      {
        freelancer_id: profile.id,
        language: data.language,
        proficiency: data.proficiency
      },
      { transaction }
    );
  });
};


const updateLanguage = async (userId, languageId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const language = await FreelancerLanguage.findOne({
      where: {
        id: languageId,
        freelancer_id: profile.id
      },
      transaction
    });
    if (!language) throw new Error("Language not found");

    await language.update(
      {
        language: data.language,
        proficiency: data.proficiency
      },
      { transaction }
    );
  });
};

const deleteLanguage = async (userId, languageId) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const deleted = await FreelancerLanguage.destroy({
      where: {
        id: languageId,
        freelancer_id: profile.id
      },
      transaction
    });

    if (!deleted) throw new Error("Language not found");
  });
};

const createPortfolio = async (userId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const existingPortfolio = await FreelancerPortfolio.findOne({
      where: {
        freelancer_id: profile.id,
        project_url: data.project_url
      },
      transaction
    });

    if (existingPortfolio) {
      throw new Error("Portfolio with this project URL already exists.");
    }

    return FreelancerPortfolio.create(
      {
        freelancer_id: profile.id,
        title: data.title,
        description: data.description,
        project_url: data.project_url
      },
      { transaction }
    );
  });
};

const updatePortfolio = async (userId, portfolioId, data) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const portfolio = await FreelancerPortfolio.findOne({
      where: {
        id: portfolioId,
        freelancer_id: profile.id
      },
      transaction
    });

    if (!portfolio) throw new Error("Portfolio not found");

    await portfolio.update(
      {
        title: data.title,
        description: data.description,
        project_url: data.project_url
      },
      { transaction }
    );
  });
};

const deletePortfolio = async (userId, portfolioId) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });

    if (!profile) throw new Error(freelancerProfileMessages.PROFILE_NOT_FOUND);

    const deleted = await FreelancerPortfolio.destroy({
      where: {
        id: portfolioId,
        freelancer_id: profile.id
      },
      transaction
    });

    if (!deleted) throw new Error("Portfolio not found");
  });
};

const getProfile = async (userId) => {
  return User.findOne({
    where: { id: userId },
    attributes: [
      "id",
      "name",
      "lastname",
      "email",
      "phone",
      "profile_picture",
      "city",
      "country"
    ],
    include: [
      {
        model: FreelancerProfile,
        as: "freelancerProfile",
        attributes: [
          "id",
          "professional_title",
          "overview",
          "hourly_rate",
          "profile_completed"
        ],
        include: [
          {
            model: FreelancerSkill,
            as: "skills",
            attributes: ["id", "skill_name", "level"]
          },
          {
            model: FreelancerExperience,
            as: "experiences"
            // attributes optional (return all)
          },
          {
            model: FreelancerEducation,
            as: "educations"
          },
          {
            model: FreelancerLanguage,
            as: "languages"
          },
          {
            model: FreelancerPortfolio,
            as: "portfolios"
          }
        ]
      }
    ]
  });
};

module.exports = {
  saveFreelancerProfile,
  updateBasicProfile,
  updateSkills,
  createExperience,
  updateExperience,
  deleteExperience,
  createEducation,
  updateEducation,
  deleteEducation,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getProfile
};