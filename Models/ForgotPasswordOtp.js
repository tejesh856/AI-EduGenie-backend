const mongoose = require("mongoose");

const forgotSchema = new mongoose.Schema({
  UserId: {
    type: String,
  },
  token: {
    type: String,
  },
  expiredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
});

module.exports = mongoose.model("forgot password", forgotSchema);
