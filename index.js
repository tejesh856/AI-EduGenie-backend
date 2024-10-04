const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { mongodb, Redis } = require("./db");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const {
  RegisterscheduleOTPExpirationCheck,
  PasswordcheduleOTPExpirationCheck,
} = require("./Utils/expireotps");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 6000;
mongodb()
  .then(() => {
    return Redis();
  })
  .then(() => {
    app.use(
      cors({
        origin: "https://ai-edu-genie.vercel.app",
        credentials: true,
      })
    );
    RegisterscheduleOTPExpirationCheck();
    PasswordcheduleOTPExpirationCheck();
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });
    // Routes
    app.use("/api", require("./Routes/Register"));
    app.use("/api", require("./Routes/Login"));
    app.use("/api", require("./Routes/Verify-link"));
    app.use("/api", require("./Routes/check-verify-token"));

    app.use("/api", require("./Routes/Forgotpassword"));
    app.use("/api", require("./Routes/VerifyForgotPassword"));
    app.use("/api", require("./Routes/GenerateRefreshToken"));
    app.use("/api", require("./Routes/Dashboard"));

    app.use(async (req, res, next) => {
      next(createError.NotFound());
    });

    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.send({
        error: {
          status: err.status || 500,
          message: err.message,
        },
      });
    });
    app.listen(PORT, () => {
      console.log(`EduGenie backend server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
