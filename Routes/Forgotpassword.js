const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../Middleware/validate");
const forgot = require("../Models/ForgotPasswordOtp");
const user = require("../Models/User");

const { sendOtpEmail } = require("../Utils/sendOtpEmail");
const createHttpError = require("http-errors");
const { generateverifytoken } = require("../Middleware/tokens");
router.post(
  "/forgot-password-link-generate",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid Email format"),
  ],
  validate,
  async (req, res, next) => {
    const { email } = req.body;
    try {
      const emailExists = await user.findOne({ email: email });
      if (!emailExists) {
        throw createHttpError.Unauthorized(
          "Enter the email address associated with your account."
        );
      }
      const forgotuser = await forgot.findOne({ UserId: emailExists.id });
      if (!forgotuser) {
        throw createHttpError.Unauthorized("Not a registered user");
      }
      const forgottoken = await generateverifytoken(emailExists.id);
      const verificationUrl = `${process.env.FRONTEND_URL}/reset-password?token=${forgottoken}`;
      const emailContent = `
      <h2>Reset  Password</h2>
      <p>Please click on the link below to reset password:</p>
      <a href="${verificationUrl}">Reset Password</a>
    `;
      forgotuser.token = forgottoken;
      forgotuser.createdAt = Date.now();
      forgotuser.expiredAt = Date.now() + 10 * 60 * 1000;
      await forgotuser.save();
      try {
        await sendOtpEmail(email, "RESET PASSWORD", emailContent);
      } catch (emailError) {
        return next(emailError);
      }
      res.status(201).json({
        message: "reset password link sent to your registered email.",
      });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
