const {
    sequelize,
    User,
    FreelancerProfile,
    FreelancerProfileMeta
} = require("../models");

const ensureProfile = async (userId, transaction) => {
    const [profile] = await FreelancerProfile.findOrCreate({
        where: { user_id: userId },
        transaction
    });

    await FreelancerProfileMeta.findOrCreate({
        where: { freelancer_id: profile.id },
        transaction
    });

    return profile;
};

const saveFullProfile = async (userId, payload) => {
    return sequelize.transaction(async (transaction) => {

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
            {
                where: { id: userId },
                transaction
            }
        );

        const profile = await ensureProfile(userId, transaction);

        await profile.update(
            {
                professional_title: payload.professional_title,
                overview: payload.overview,
                hourly_rate: payload.hourly_rate,
                profile_completed: true
            },
            { transaction }
        );

        const meta = await FreelancerProfileMeta.findOne({
            where: { freelancer_id: profile.id },
            transaction
        });

        await meta.update(
            {
                skills: payload.skills || [],
                experiences: payload.experiences || [],
                educations: payload.educations || [],
                languages: payload.languages || [],
                portfolios: payload.portfolios || []
            },
            { transaction }
        );

        return profile;
    });
};

const updateProfile = async (userId, payload) => {
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

        const userUpdateData = {};
        userFields.forEach(field => {
            if (payload[field] !== undefined) {
                userUpdateData[field] = payload[field];
            }
        });

        if (Object.keys(userUpdateData).length > 0) {
            await User.update(userUpdateData, {
                where: { id: userId },
                transaction
            });
        }

        const profile = await FreelancerProfile.findOne({
            where: { user_id: userId },
            transaction
        });

        if (!profile) {
            throw new Error("Freelancer profile not found");
        }

        const profileFields = [
            "professional_title",
            "overview",
            "hourly_rate"
        ];

        const profileUpdateData = {};
        profileFields.forEach(field => {
            if (payload[field] !== undefined) {
                profileUpdateData[field] = payload[field];
            }
        });

        if (Object.keys(profileUpdateData).length > 0) {
            await profile.update(profileUpdateData, { transaction });
        }

        const meta = await FreelancerProfileMeta.findOne({
            where: { freelancer_id: profile.id },
            transaction
        });

        if (!meta) {
            throw new Error("Profile meta not found");
        }

        const metaFields = [
            "skills",
            "experiences",
            "educations",
            "languages",
            "portfolios"
        ];

        const metaUpdateData = {};
        metaFields.forEach(field => {
            if (payload[field] !== undefined) {
                metaUpdateData[field] = payload[field];
            }
        });

        if (Object.keys(metaUpdateData).length > 0) {
            await meta.update(metaUpdateData, { transaction });
        }

        return true;
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

        include: [{
            model: FreelancerProfile,
            as: "freelancerProfile",
            attributes: [
                "id",
                "professional_title",
                "overview",
                "hourly_rate",
                "profile_completed"
            ],
            include: [{
                model: FreelancerProfileMeta,
                as: "meta",
                attributes: [
                    "skills",
                    "experiences",
                    "educations",
                    "languages",
                    "portfolios"
                ]
            }]
        }]
    });
};


module.exports = {
    saveFullProfile,
    updateProfile,
    getProfile
};
