const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../Middleware/validate");
const bcrypt = require("bcrypt");
const user = require("../Models/User");
const forgot = require("../Models/ForgotPasswordOtp");
const { sendOtpEmail } = require("../Utils/sendOtpEmail");
const createHttpError = require("http-errors");
const { generateverifytoken } = require("../Middleware/tokens");
router.post(
  "/register",
  [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid Email format"),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .trim(),
    body("name")
      .notEmpty()
      .withMessage("name is required.")
      .isLength({ min: 3 })
      .withMessage("name must be atleast 3 characters long")
      .trim(),
  ],
  validate,
  async (req, res, next) => {
    const { name, email, password } = req.body;
    try {
      const emailExists = await user.findOne({ email: email });
      if (emailExists) {
        throw createHttpError.Unauthorized("User already registered.");
      }
      const salt = await bcrypt.genSalt(10);
      let secpassword = await bcrypt.hash(password, salt);
      const newUser = new user({
        name,
        email,
        password: secpassword,
        createdAt: Date.now(),
        expiredAt: Date.now() + 10 * 60 * 1000,
      });
      const newforgot = new forgot({
        UserId: newUser.id,
      });
      const verificationToken = await generateverifytoken(newUser.id);
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
      newUser.verifyToken = verificationToken;
      newUser.save();
      newforgot.save();

      res.status(201).json({ message: "Activation link send to your Email" });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
