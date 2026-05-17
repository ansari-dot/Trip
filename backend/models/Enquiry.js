import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    type: {
      type: String,
      trim: true,
      default: "ai-chat",
    },
    source: {
      type: String,
      trim: true,
      default: "trip-planner",
    },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enquiry", enquirySchema);
