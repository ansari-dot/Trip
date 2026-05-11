import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  const { MONGODB_URI, NODE_ENV = "development" } = process.env;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in the environment variables.");
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    });

    if (NODE_ENV === "development") {
      console.log(`MongoDB connected: ${connection.connection.host}`);
      mongoose.set("debug", true);
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
