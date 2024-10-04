const express = require("express");
const router = express.Router();
const user = require("../Models/User");
const forgot = require("../Models/ForgotPasswordOtp");
const createHttpError = require("http-errors");
const bcrypt = require("bcrypt");
const { verifyverificationtoken } = require("../Middleware/tokens");
router.post(
  "/forgot-password-verify",
  verifyverificationtoken,
  async (req, res, next) => {
    const { id } = req.payload;
    const { password } = req.body;
    try {
      const emailExists = await user.findById(id);
      if (!emailExists) {
        throw createHttpError.Unauthorized("User does not exist");
      }
      const forgotuser = await forgot.findOne({ UserId: emailExists.id });

      if (!forgotuser.token) {
        throw createHttpError.Unauthorized("link not generated or expired");
      }
      let passwordExists = await bcrypt.compare(password, emailExists.password);
      if (passwordExists) {
        throw createHttpError.Unauthorized(
          "This password is already in use. Please choose a different one."
        );
      }
      const fieldsToRemove = {
        token: "",
        expiredAt: "",
        createdAt: "",
      };

      // Use $unset to remove specified fields from the user document
      await forgot.findOneAndUpdate(
        { UserId: emailExists._id },
        {
          $unset: fieldsToRemove,
        }
      );
      const salt = await bcrypt.genSalt(10);
      let secpassword = await bcrypt.hash(password, salt);
      emailExists.password = secpassword;
      emailExists.save();
      res.status(201).json({ message: "New Password created successfully" });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
