const mongoose = require("mongoose");

const MAX_RETRIES = Number(process.env.MONGO_MAX_RETRIES || 5);
const RETRY_DELAY_MS = Number(process.env.MONGO_RETRY_DELAY_MS || 4000);
const SERVER_SELECTION_TIMEOUT_MS = Number(
  process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 15000
);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing MONGO_URI environment variable. Set it in Railway before deploying."
    );
  }

  mongoose.set("strictQuery", false);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      });

      console.log(
        `✅ MongoDB connected (attempt ${attempt}/${MAX_RETRIES}) - host: ${
          mongoose.connection.host
        }`
      );
      return mongoose.connection;
    } catch (error) {
      console.error(
        `❌ MongoDB connection attempt ${attempt} failed: ${error.message}`
      );

      if (attempt === MAX_RETRIES) {
        console.error(
          "Exceeded maximum MongoDB connection retries. Verify that Railway can reach MongoDB Atlas (IP allow list, credentials, SRV record) and redeploy."
        );
        throw error;
      }

      console.log(
        `Retrying in ${Math.round(RETRY_DELAY_MS / 1000)}s... (${attempt}/${MAX_RETRIES})`
      );
      await wait(RETRY_DELAY_MS);
    }
  }

  return mongoose.connection;
}

module.exports = connectDB;
