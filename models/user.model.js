"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Role, {
                foreignKey: "role_id",
                onDelete: "SET NULL"
            });

            User.hasOne(models.FreelancerProfile, {
                foreignKey: "user_id",
                as: "freelancerProfile",
                onDelete: "CASCADE"
            });
        }
    }

    User.init(
        {
            // BASIC
            name: { type: DataTypes.STRING, allowNull: false },
            lastname: DataTypes.STRING,
            age: DataTypes.INTEGER,
            phone: DataTypes.STRING,

            username: { type: DataTypes.STRING, unique: true },
            email: { type: DataTypes.STRING, unique: true, allowNull: false },
            password: { type: DataTypes.STRING, allowNull: false },

            // ROLE
            role_id: DataTypes.INTEGER,

            // PROFILE (UI FIELDS)
            profile_picture: DataTypes.STRING,
            date_of_birth: DataTypes.DATE,
            street_address: DataTypes.STRING,
            apt_suite: DataTypes.STRING,
            city: DataTypes.STRING,
            state: DataTypes.STRING,
            zip_code: DataTypes.STRING,
            country: DataTypes.STRING,

            // AUTH / SECURITY (🔥 YE WAHI FIELDS HAIN)
            is_email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
            email_verification_code: DataTypes.STRING,
            email_verification_expires_at: DataTypes.DATE,

            is_phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },

            last_login: DataTypes.DATE,

            password_reset_code: DataTypes.STRING,
            password_reset_expires_at: DataTypes.DATE,

            email_send_failed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            sequelize,
            modelName: "User",
            tableName: "users",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    return User;
};
