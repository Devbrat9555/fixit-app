const twilio = require('twilio');

const sendSMS = async (phone, message) => {
  if (!phone) {
    console.warn(`[SMS SKIPPED]: No phone number provided for message: ${message}`);
    return;
  }

  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE,
      to: phone.startsWith('+') ? phone : `+91${phone}` 
    });
    console.log(`[REAL SMS SENT to ${phone}]: ${message}`);
  } catch (err) {
    console.error(`[SMS FAILED to ${phone}]: ${err.message}`);
  }
};

module.exports = sendSMS;
