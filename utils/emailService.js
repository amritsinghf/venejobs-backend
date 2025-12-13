const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log("SMTP CONFIG CHECK 👉", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? "✅ SET" : "❌ NOT SET",
});

async function sendVerificationEmail(to, code, name) {
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #0072ff, #00c6ff); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Venejob 👋</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #333;">Hello, ${name}!</h2>
        <p style="font-size: 16px; color: #555;">Thank you for creating an account with <strong>Venejob</strong>.</p>
        <p style="font-size: 16px; color: #555;">Use the verification code below to verify your email address:</p>
        <div style="margin: 25px 0;">
          <span style="font-size: 32px; letter-spacing: 5px; color: #0072ff; font-weight: bold;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes. Please don’t share it with anyone.</p>
      </div>
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 13px; color: #888;">
        © ${new Date().getFullYear()} Venejob. All rights reserved.
      </div>
    </div>
  </div>
  `;
  console.log("Yes I am called")
  await transporter.verify().then(() => {
    console.log("SMTP CONNECTED ✔");
  }).catch(err => {
    console.error("SMTP ERROR ❌:", err);
  });
  await transporter.sendMail({
    from: `"Venejob" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verify your Venejob Email Address',
    html
  });
}


async function sendPasswordResetEmail(to, code, name) {
  const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #ff6a00, #ee0979); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request 🔒</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #333;">Hello, ${name}!</h2>
        <p style="font-size: 16px; color: #555;">We received a request to reset your password on <strong>Venejob</strong>.</p>
        <p style="font-size: 16px; color: #555;">Use the reset code below to proceed:</p>
        <div style="margin: 25px 0;">
          <span style="font-size: 32px; letter-spacing: 5px; color: #ff6a00; font-weight: bold;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes. Please don’t share it with anyone.</p>
      </div>
      <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 13px; color: #888;">
        © ${new Date().getFullYear()} Venejob. All rights reserved.
      </div>
    </div>
  </div>`;

  await transporter.sendMail({
    from: `"Venejob" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Your Venejob Password',
    html
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };