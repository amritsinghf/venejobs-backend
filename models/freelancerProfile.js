"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class FreelancerProfile extends Model {
        static associate(models) {
            FreelancerProfile.belongsTo(models.User, {
                foreignKey: "user_id",
                onDelete: "CASCADE"
            });

            FreelancerProfile.hasOne(models.FreelancerProfileMeta, {
                foreignKey: "freelancer_id",
                as: "meta",
                onDelete: "CASCADE"
            });
        }
    }

    FreelancerProfile.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        professional_title: DataTypes.STRING,
        overview: DataTypes.TEXT,
        hourly_rate: DataTypes.FLOAT,
        country: DataTypes.STRING,
        city: DataTypes.STRING,
        profile_completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: "FreelancerProfile",
        tableName: "freelancer_profiles"
    });

    return FreelancerProfile;
};
