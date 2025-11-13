const bcrypt = require("bcryptjs");
const { User, Role } = require("../models");

async function createOrUpdateAdmin() {
    const adminRole = await Role.findOne({ where: { name: "admin" } });

    if (!adminRole) {
        console.error("❌ Admin role does not exist!");
        return;
    }

    const email = process.env.ADMIN_EMAIL;

    const existing = await User.findOne({ where: { email } });
    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const adminData = {
        name: process.env.ADMIN_NAME,
        lastname: process.env.ADMIN_LASTNAME,
        age: process.env.ADMIN_AGE,
        phone: process.env.ADMIN_PHONE,
        email,
        password: hashed,
        role_id: adminRole.id
    };

    if (existing) {
        await existing.update(adminData);
        console.log(`🔄 Admin updated → ${email}`);
    } else {
        await User.create(adminData);
        console.log(`✅ Admin created → ${email}`);
    }
}

module.exports = createOrUpdateAdmin;
