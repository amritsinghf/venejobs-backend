"use strict";

module.exports = (sequelize, DataTypes) => {
    const FreelancerProfile = sequelize.define(
        "FreelancerProfile",
        {
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            professional_title: {
                type: DataTypes.STRING,
                allowNull: false
            },

            overview: {
                type: DataTypes.TEXT,
                allowNull: false
            },

            hourly_rate: {
                type: DataTypes.FLOAT,
                allowNull: false
            },

            country: {
                type: DataTypes.STRING,
                allowNull: false
            },

            city: {
                type: DataTypes.STRING,
                allowNull: false
            },

            profile_completed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            tableName: "freelancer_profiles",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    FreelancerProfile.associate = (models) => {
        FreelancerProfile.belongsTo(models.User, {
            foreignKey: "user_id",
            onDelete: "CASCADE"
        });

        FreelancerProfile.hasOne(models.FreelancerProfileMeta, {
            foreignKey: "freelancer_id",
            as: "meta",
            onDelete: "CASCADE"
        });
    };

    return FreelancerProfile;
};
