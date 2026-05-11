import mongoose from "mongoose";

const quoteRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      trim: true,
    },
    travelDates: {
      type: String,
      trim: true,
    },
    travelers: {
      type: Number,
    },
    numberOfDays: {
      type: Number,
    },
    message: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      trim: true,
    },
    serviceDetails: {
      type: Map,
      of: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Contacted", "Closed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("QuoteRequest", quoteRequestSchema);
