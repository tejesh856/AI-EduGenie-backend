const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../Middleware/validate");
const bcrypt = require("bcrypt");
const user = require("../Models/User");
const createError = require("http-errors");
const {
  generateaccesstoken,
  generaterefreshtoken,
  generateverifytoken,
} = require("../Middleware/tokens");
const { sendOtpEmail } = require("../Utils/sendOtpEmail");
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid Email format"),
    body("password").notEmpty().withMessage("Password is required").trim(),
  ],
  validate,
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const emailExists = await user.findOne({ email: email });
      if (!emailExists) {
        throw createError.Unauthorized("Email/Password not valid");
      }
      let passwordExists = await bcrypt.compare(password, emailExists.password);
      if (!passwordExists) {
        throw createError.Unauthorized("Email/Password not valid");
      }
      if (!emailExists.isVerified) {
        const verificationToken = await generateverifytoken(emailExists.id);
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailContent = `
      <h2>Email Verification</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
    `;
        try {
          await sendOtpEmail(email, "Email Verification", emailContent);
        } catch (emailError) {
          return next(emailError);
        }
        emailExists.verifyToken = verificationToken;
        emailExists.createdAt = Date.now();
        emailExists.expiredAt = Date.now() + 10 * 60 * 1000;
        emailExists.save();
        return res.status(201).json({
          message: "Verify OTP sent to your registered Email.",
          isVerified: false,
          verificationToken: verificationToken,
        });
      }
      const accessToken = await generateaccesstoken(emailExists.id);
      const refreshToken = await generaterefreshtoken(emailExists.id);
      return res.status(201).json({
        message: "login successfull",
        accessToken,
        refreshToken,
        name: emailExists.name,
        isVerified: true,
      });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
