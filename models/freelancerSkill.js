"use strict";

module.exports = (sequelize, DataTypes) => {
    const FreelancerSkill = sequelize.define(
        "FreelancerSkill",
        {
            freelancer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            skill_name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            level: {
                type: DataTypes.STRING
            }
        },
        {
            tableName: "freelancer_skills",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    FreelancerSkill.associate = (models) => {
        FreelancerSkill.belongsTo(models.FreelancerProfile, {
            foreignKey: "freelancer_id",
            onDelete: "CASCADE"
        });
    };

    return FreelancerSkill;
};
