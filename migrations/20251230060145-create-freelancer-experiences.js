"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("freelancer_experiences", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      freelancer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "freelancer_profiles",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },

      company_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      role: {
        type: Sequelize.STRING,
        allowNull: false
      },

      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },

      end_date: {
        type: Sequelize.DATE
      },

      description: {
        type: Sequelize.TEXT
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("freelancer_experiences");
  }
};
