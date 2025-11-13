"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Job extends Model {
        static associate(models) {
            Job.belongsTo(models.User, {
                foreignKey: "client_id",
                as: "client"
            });
        }
    }

    Job.init(
        {
            title: DataTypes.STRING,
            description: DataTypes.TEXT,
            category: DataTypes.STRING,
            skills: DataTypes.ARRAY(DataTypes.STRING),
            project_size: DataTypes.STRING,
            duration: DataTypes.STRING,
            experience_level: DataTypes.STRING,

            budget_type: DataTypes.STRING,
            budget_amount: DataTypes.FLOAT,

            status: {
                type: DataTypes.ENUM("draft", "published", "paused", "closed"),
                allowNull: false,
                defaultValue: "draft"
            },

            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },

            client_id: DataTypes.INTEGER
        },
        {
            sequelize,
            modelName: "Job",
            tableName: "jobs",

            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    return Job;
};
