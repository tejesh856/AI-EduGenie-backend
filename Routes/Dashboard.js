const express = require("express");
const router = express.Router();
const user = require("../Models/User");
const createError = require("http-errors");
const { verifyaccesstoken } = require("../Middleware/tokens");
router.get("/dashboard", verifyaccesstoken, async (req, res, next) => {
  try {
    const getUser = await user.findById(req.payload.id, "-password");
    res.json({ message: "retrieve successfull", user: getUser });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
