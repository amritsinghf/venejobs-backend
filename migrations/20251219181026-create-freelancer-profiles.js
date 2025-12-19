"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("freelancer_profiles", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      professional_title: Sequelize.STRING,
      overview: Sequelize.TEXT,
      hourly_rate: Sequelize.FLOAT,
      country: Sequelize.STRING,
      city: Sequelize.STRING,
      profile_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("freelancer_profiles");
  }
};
