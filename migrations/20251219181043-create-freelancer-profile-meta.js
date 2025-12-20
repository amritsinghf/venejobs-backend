"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("freelancer_profile_meta", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },

            freelancer_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: "freelancer_profiles",
                    key: "id"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },

            skills: {
                type: Sequelize.JSON,
                allowNull: false
            },
            experiences: {
                type: Sequelize.JSON,
                allowNull: false
            },
            educations: {
                type: Sequelize.JSON,
                allowNull: false
            },
            languages: {
                type: Sequelize.JSON,
                allowNull: false
            },
            portfolios: {
                type: Sequelize.JSON,
                allowNull: false
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("freelancer_profile_meta");
    }
};
