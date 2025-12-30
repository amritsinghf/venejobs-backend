"use strict";

module.exports = (sequelize, DataTypes) => {
    const FreelancerEducation = sequelize.define(
        "FreelancerEducation",
        {
            freelancer_id: {
                type: DataTypes.INTEGER,
                allowNull: false
            },

            institution_name: {
                type: DataTypes.STRING,
                allowNull: false
            },

            degree: {
                type: DataTypes.STRING
            },

            field_of_study: {
                type: DataTypes.STRING
            },

            type_of_education: {
                type: DataTypes.STRING
            },

            start_date: {
                type: DataTypes.DATE
            },

            end_date: {
                type: DataTypes.DATE
            },

            description: {
                type: DataTypes.TEXT
            }
        },
        {
            tableName: "freelancer_educations",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    );

    FreelancerEducation.associate = (models) => {
        FreelancerEducation.belongsTo(models.FreelancerProfile, {
            foreignKey: "freelancer_id",
            onDelete: "CASCADE"
        });
    };

    return FreelancerEducation;
};
