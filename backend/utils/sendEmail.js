const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!options.email) {
    console.warn(`[EMAIL SKIPPED]: No recipient email provided for: ${options.subject}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || 'Fixit'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error(`[EMAIL FAILED to ${options.email}]: ${err.message}`);
  }
};

module.exports = sendEmail;
