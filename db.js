const mongoose = require("mongoose");
const redis = require("redis");

const mongodb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT },
});
const Redis = async () => {
  try {
    await client.connect();
    console.log("redis connected successfully.");
  } catch (error) {
    console.error("Redis connection error:", error);
    await client.disconnect();
    throw error;
  }
};

module.exports = { mongodb, Redis, client };
