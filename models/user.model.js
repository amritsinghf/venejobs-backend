"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Role, {
                foreignKey: "role_id",
                onDelete: "SET NULL"
            });
        }
    }

    User.init(
        {
            name: { type: DataTypes.STRING, allowNull: false },
            lastname: DataTypes.STRING,
            age: DataTypes.INTEGER,
            phone: DataTypes.STRING,

            username: { type: DataTypes.STRING, unique: true },
            email: { type: DataTypes.STRING, unique: true, allowNull: false },
            password: { type: DataTypes.STRING, allowNull: false },

            role_id: DataTypes.INTEGER,

            is_email_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
            email_verification_code: DataTypes.STRING,
            email_verification_expires_at: DataTypes.DATE,

            is_phone_verified: { type: DataTypes.BOOLEAN, defaultValue: false },

            profile_picture: DataTypes.STRING,
            last_login: DataTypes.DATE,

            password_reset_code: DataTypes.STRING,
            password_reset_expires_at: DataTypes.DATE,

            email_send_failed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
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
