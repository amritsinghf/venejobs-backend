"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastname: Sequelize.STRING,
      age: Sequelize.INTEGER,
      phone: Sequelize.STRING,

      username: {
        type: Sequelize.STRING,
        unique: true
      },

      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "roles",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },

      is_email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      email_verification_code: Sequelize.STRING,
      email_verification_expires_at: Sequelize.DATE,

      is_phone_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      profile_picture: Sequelize.STRING,
      last_login: Sequelize.DATE,

      password_reset_code: Sequelize.STRING,
      password_reset_expires_at: Sequelize.DATE,

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
    await queryInterface.dropTable("users");
  }
};
