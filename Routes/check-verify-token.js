const express = require("express");
const router = express.Router();
const user = require("../Models/User");
const forgot = require("../Models/ForgotPasswordOtp");
const createHttpError = require("http-errors");
const { verifyverificationtoken } = require("../Middleware/tokens");
router.get(
  "/check-verify-token",
  verifyverificationtoken,
  async (req, res, next) => {
    const { id } = req.payload;
    const { path } = req.query;
    try {
      if (path === "/verify-email") {
        const userExists = await user.findById(id);
        if (!userExists) {
          throw createHttpError.Unauthorized("Invalid token");
        }
        if (!userExists.verifyToken) {
          throw createHttpError.Unauthorized("link not generated or Expired");
        }
      }
      if (path === "/reset-password") {
        const userExists = await forgot.findOne({ UserId: id });
        if (!userExists) {
          throw createHttpError.Unauthorized("Invalid token");
        }
        if (!userExists.token) {
          throw createHttpError.Unauthorized("link not generated or Expired");
        }
      }
      return res.status(201).json({
        message: "Your Token is valid",
      });
    } catch (error) {
      next(error);
    }
  }
);
module.exports = router;
