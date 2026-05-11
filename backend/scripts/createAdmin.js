import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db.js";
import Admin from "../models/Admin.js";

dotenv.config();

const [, , nameArg, emailArg, passwordArg] = process.argv;

const name = nameArg || process.env.ADMIN_NAME;
const email = emailArg || process.env.ADMIN_EMAIL;
const password = passwordArg || process.env.ADMIN_PASSWORD;

const closeConnection = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("Failed to close database connection:", error.message);
  }
};

const validateInput = () => {
  if (!name || !email || !password) {
    console.error(
      "Usage: npm run create-admin -- \"Admin Name\" admin@example.com strongpassword"
    );
    console.error(
      "You can also set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your environment."
    );
    process.exit(1);
  }
};

const createAdmin = async () => {
  validateInput();
  await connectDB();

  try {
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log(`Admin already exists for email: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("Admin created successfully.");
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
  } finally {
    await closeConnection();
  }
};

createAdmin().catch(async (error) => {
  console.error("Failed to create admin:", error.message);
  await closeConnection();
  process.exit(1);
});
