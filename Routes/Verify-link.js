const express = require("express");
const router = express.Router();
const user = require("../Models/User");
const createHttpError = require("http-errors");
const { verifyverificationtoken } = require("../Middleware/tokens");
router.get("/verify-link", verifyverificationtoken, async (req, res, next) => {
  const { id } = req.payload;
  try {
    const userExists = await user.findById(id);
    if (!userExists) {
      throw createHttpError.Unauthorized("Invalid token");
    }
    if (!userExists.verifyToken) {
      throw createHttpError.Unauthorized("link not generated or Expired");
    }
    const fieldsToRemove = {
      verifyToken: "",
      expiredAt: "",
      createdAt: "",
    };
    await user.findByIdAndUpdate(id, {
      $unset: fieldsToRemove,
    });
    userExists.isVerified = true;
    userExists.save();
    return res.status(201).json({
      message: "Your EduGenie account verified successfully",
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
