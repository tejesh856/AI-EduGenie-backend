const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.OTP_PASS,
  },
});

const sendOtpEmail = (email, subject, Emailcontent) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: subject,
    html: Emailcontent,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(createError(500, "Failed to send OTP email: " + error.message));
      } else {
        resolve(info);
      }
    });
  });
};

module.exports = { sendOtpEmail };
