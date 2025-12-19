"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      // BASIC INFO
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastname: Sequelize.STRING,
      age: Sequelize.INTEGER,
      phone: Sequelize.STRING,

      // AUTH
      username: {
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      // ROLE
      role_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "roles",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },

      // PROFILE / UI FIELDS
      profile_picture: Sequelize.STRING,
      date_of_birth: Sequelize.DATE,
      street_address: Sequelize.STRING,
      apt_suite: Sequelize.STRING,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      zip_code: Sequelize.STRING,
      country: Sequelize.STRING,

      // VERIFICATION
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

      // SECURITY
      last_login: Sequelize.DATE,
      password_reset_code: Sequelize.STRING,
      password_reset_expires_at: Sequelize.DATE,

      email_send_failed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      // TIMESTAMPS
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  }
};
