const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verifyToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  expiredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
  },
  token: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
