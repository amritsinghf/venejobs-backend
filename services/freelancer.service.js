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

    if (!profile) throw new Error("Freelancer profile not found");

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
    if (!profile) throw new Error("Profile not found");

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

const updateExperiences = async (userId, experiences) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error("Profile not found");

    await FreelancerExperience.destroy({
      where: { freelancer_id: profile.id },
      transaction
    });

    if (experiences?.length) {
      await FreelancerExperience.bulkCreate(
        experiences.map(exp => ({
          freelancer_id: profile.id,
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
  });
};

const updateEducations = async (userId, educations) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error("Profile not found");

    await FreelancerEducation.destroy({
      where: { freelancer_id: profile.id },
      transaction
    });

    if (educations?.length) {
      await FreelancerEducation.bulkCreate(
        educations.map(edu => ({
          freelancer_id: profile.id,
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
  });
};

const updateLanguages = async (userId, languages) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error("Profile not found");

    await FreelancerLanguage.destroy({
      where: { freelancer_id: profile.id },
      transaction
    });

    if (languages?.length) {
      await FreelancerLanguage.bulkCreate(
        languages.map(lang => ({
          freelancer_id: profile.id,
          language: lang.language,
          proficiency: lang.proficiency
        })),
        { transaction }
      );
    }
  });
};

const updatePortfolios = async (userId, portfolios) => {
  return sequelize.transaction(async (transaction) => {
    const profile = await FreelancerProfile.findOne({
      where: { user_id: userId },
      transaction
    });
    if (!profile) throw new Error("Profile not found");

    await FreelancerPortfolio.destroy({
      where: { freelancer_id: profile.id },
      transaction
    });

    if (portfolios?.length) {
      await FreelancerPortfolio.bulkCreate(
        portfolios.map(port => ({
          freelancer_id: profile.id,
          title: port.title,
          description: port.description,
          project_url: port.project_url
        })),
        { transaction }
      );
    }
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
  updateExperiences,
  updateEducations,
  updateLanguages,
  updatePortfolios,
  getProfile
};