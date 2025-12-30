"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("freelancer_skills", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
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

      skill_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      level: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable("freelancer_skills");
  }
};
