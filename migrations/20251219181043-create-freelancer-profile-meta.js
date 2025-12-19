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
                allowNull: false
            },
            skills: {
                type: Sequelize.JSON,
                defaultValue: []
            },
            experiences: {
                type: Sequelize.JSON,
                defaultValue: []
            },
            educations: {
                type: Sequelize.JSON,
                defaultValue: []
            },
            languages: {
                type: Sequelize.JSON,
                defaultValue: []
            },
            portfolios: {
                type: Sequelize.JSON,
                defaultValue: []
            }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("freelancer_profile_meta");
    }
};
