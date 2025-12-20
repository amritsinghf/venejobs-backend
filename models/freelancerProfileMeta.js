"use strict";

module.exports = (sequelize, DataTypes) => {
    const FreelancerProfileMeta = sequelize.define(
        "FreelancerProfileMeta",
        {
            freelancer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            skills: {
                type: DataTypes.JSON,
                allowNull: false
            },

            experiences: {
                type: DataTypes.JSON,
                allowNull: false
            },

            educations: {
                type: DataTypes.JSON,
                allowNull: false
            },

            languages: {
                type: DataTypes.JSON,
                allowNull: false
            },

            portfolios: {
                type: DataTypes.JSON,
                allowNull: false
            }
        },
        {
            tableName: "freelancer_profile_meta",
            timestamps: false
        }
    );

    FreelancerProfileMeta.associate = (models) => {
        FreelancerProfileMeta.belongsTo(models.FreelancerProfile, {
            foreignKey: "freelancer_id",
            onDelete: "CASCADE"
        });
    };

    return FreelancerProfileMeta;
};
