const express = require("express");
const router = express.Router();
const createError = require("http-errors");
const {
  generateaccesstoken,
  generaterefreshtoken,
  verifyrefreshtoken,
} = require("../Middleware/tokens");

router.post("/generate-refresh-tokens", async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader.split(" ")[1];
    if (!refreshToken)
      return next(createError.BadRequest("Refresh token missing"));
    const { id } = await verifyrefreshtoken(refreshToken);
    const accessToken = await generateaccesstoken(id);
    const newRefreshToken = await generaterefreshtoken(id);

    // Set cookies with tokens

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
