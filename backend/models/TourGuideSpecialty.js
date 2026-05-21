import mongoose from "mongoose";

const tourGuideSpecialtySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("TourGuideSpecialty", tourGuideSpecialtySchema);
