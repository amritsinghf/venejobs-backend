const User = require('../models/User');

async function findUserByEmail(email) {
  return await User.findByEmail(email);
}

async function createUser(data) {
  return await User.create(data);
}

async function updateUser(id, updates) {
  return await User.update(id, updates);
}

module.exports = { findUserByEmail, createUser, updateUser };