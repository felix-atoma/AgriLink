// utils/sendEmail.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: `"AgriLink Team" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to AgriLink!',
    html: `
      <h2>Hello ${name},</h2>
      <p>🎉 Welcome to <strong>AgriLink</strong> – your trusted digital farming partner.</p>
      <p>We're excited to have you on board!</p>
      <hr/>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Happy farming! 🚜🌱</p>
    `
  };

  return transporter.sendMail(mailOptions);
};
