const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "5m";
const VERIFY_TOKEN_EXPIRY = process.env.VERIFY_TOKEN_EXPIRY || "10m";
const generateaccesstoken = (id) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { id },
      process.env.ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
      (err, token) => {
        if (err)
          reject(
            createError.InternalServerError("Error generating access token")
          );

        resolve(token);
      }
    );
  });
};
const generateverifytoken = (id) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { id },
      process.env.VERIFY_SECRET, // Ensure the same secret is used
      { expiresIn: VERIFY_TOKEN_EXPIRY }, // Make sure expiry is set
      (err, token) => {
        if (err)
          reject(
            createError.InternalServerError("Error generating access token")
          );

        resolve(token);
      }
    );
  });
};

const generaterefreshtoken = async (id) => {
  try {
    // Invalidate old refresh token if needed (this part is commented out)
    /*
    if (oldRefreshToken) {
      const storedToken = await client.get(id);
      if (storedToken && storedToken === oldRefreshToken) {
        await client.del(id); // Remove the old refresh token
      }
    }
    */

    // Generate new refresh token
    const token = await new Promise((resolve, reject) => {
      jwt.sign(
        { id },
        process.env.REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY },
        (err, token) => {
          if (err) {
            return reject(
              createError.InternalServerError("Error generating refresh token")
            );
          }
          resolve(token);
        }
      );
    });
    // Update user with the new token
    /*const updatedUser = await User.findByIdAndUpdate(
      id,
      { token: token },
      { new: true }
    );

    // Check if the user was found and updated
    if (!updatedUser) {
      throw createError.NotFound("User not found");
    }*/

    // Optionally, you can log the updated user to verify
    //console.log("User updated:", updatedUser);

    // Store new token in Redis with expiration (if needed)
    // await client.set(id, token, { EX: 5 * 60 }); // Store for 5 minutes or adjust as needed

    return token;
  } catch (err) {
    throw createError.InternalServerError("Error storing refresh token");
  }
};

const verifyaccesstoken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(createError.Unauthorized("No access token provided"));
  }

  jwt.verify(token, process.env.ACCESS_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }
    req.payload = payload; // Attach payload to request object
    next();
  });
};
const verifyverificationtoken = (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    return next(createError.Unauthorized("No verify token provided"));
  }
  jwt.verify(token, process.env.VERIFY_SECRET, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return next(createError.Unauthorized(message));
    }
    req.payload = payload; // Attach payload to request object
    next();
  });
};

const verifyrefreshtoken = async (refreshToken) => {
  try {
    /*const existToken = await User.findOne({ token: refreshToken });
    console.log("refresh token", refreshToken);
    console.log("exist token", existToken);
    if (!existToken) {
      throw createError.Unauthorized("Invalid refresh token");
    }*/
    const payload = await new Promise((resolve, reject) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET,
        (err, decodedPayload) => {
          if (err) {
            const message =
              err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
            return reject(createError.Unauthorized(message));
          }
          resolve(decodedPayload);
        }
      );
    });
    return payload;

    /*const storedToken = await client.get(payload.id);
    console.log(payload.id);

    if (!storedToken) {
      throw createError.Unauthorized("Refresh token expired.");
    }

    if (storedToken === refreshToken) {
      return payload;
    } else {
      throw createError.Unauthorized("Refresh token mismatch");
    }*/
  } catch (err) {
    throw createError.InternalServerError("Error Verifying refresh token");
  }
};

module.exports = {
  generateaccesstoken,
  generaterefreshtoken,
  verifyaccesstoken,
  verifyrefreshtoken,
  generateverifytoken,
  verifyverificationtoken,
};
