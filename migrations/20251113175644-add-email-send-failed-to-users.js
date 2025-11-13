"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "email_send_failed", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: "password_reset_expires_at"
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "email_send_failed");
  }
};
