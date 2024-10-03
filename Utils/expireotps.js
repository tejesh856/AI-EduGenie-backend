var cron = require("node-cron");
const user = require("../Models/User");
const forgot = require("../Models/ForgotPasswordOtp");
const RegisterscheduleOTPExpirationCheck = () => {
  cron.schedule("* * * * * *", async () => {
    const newDate = new Date().getTime();
    const fieldsToRemove = {
      verifyToken: "",
      expiredAt: "",
      createdAt: "",
    };

    // Use $unset to remove specified fields from the user document
    const userswithexpirytokens = await user.find({
      verifyToken: { $exists: true, $ne: null },
    });
    await Promise.all(
      userswithexpirytokens.map(async (value, index) => {
        if (value.expiredAt.getTime() - newDate < 0) {
          await user.findByIdAndUpdate(value._id, {
            $unset: fieldsToRemove,
          });
          /*await user.findByIdAndDelete(value.id);
          await forgot.findOneAndDelete({ UserId: value.id });*/
        }
      })
    );
  });
};
const PasswordcheduleOTPExpirationCheck = () => {
  cron.schedule("* * * * * *", async () => {
    const newDate = new Date().getTime();
    const fieldsToRemove = {
      token: "",
      expiredAt: "",
      createdAt: "",
    };

    // Use $unset to remove specified fields from the user document
    const userswithexpiryotps = await forgot.find({
      token: { $exists: true, $ne: null },
    });
    await Promise.all(
      userswithexpiryotps.map(async (value, index) => {
        if (value.expiredAt.getTime() - newDate < 0) {
          await forgot.findByIdAndUpdate(value._id, {
            $unset: fieldsToRemove,
          });
        }
      })
    );
  });
};
module.exports = {
  RegisterscheduleOTPExpirationCheck,
  PasswordcheduleOTPExpirationCheck,
};
