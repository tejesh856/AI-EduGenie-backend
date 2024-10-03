const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { validate } = require("../Middleware/validate");
const user = require("../Models/User");
const createHttpError = require("http-errors");
const bcrypt = require("bcrypt");
router.post(
  "/new-password",
  [
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .trim(),
  ],
  validate,
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const emailExists = await user.findOne({ email: email });
      if (!emailExists) {
        return res.status(400).json({
          success: false,
          message: {
            email: [`Invalid Email`],
          },
        });
      }
      const passwordExist = bcrypt.compare(password, emailExists.password);
      if (!passwordExist) {
        throw createHttpError.Unauthorized("Invalid Password.");
      }
      res.status(201).json({ message: "New password created." });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
