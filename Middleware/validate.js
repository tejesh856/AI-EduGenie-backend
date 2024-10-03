const { validationResult } = require("express-validator");
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = {};
    errors.array().forEach((error) => {
      if (!errorMessages[error.path]) {
        errorMessages[error.path] = [];
      }
      errorMessages[error.path].push(error.msg);
    });
    return res.status(400).json({ success: false, message: errorMessages });
  }
  next();
};

module.exports = {
  validate,
};
