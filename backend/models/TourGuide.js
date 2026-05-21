import mongoose from "mongoose";

const tourGuideSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    gallery: [{ type: String }],
    shortBio: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true },
    experience: { type: String, default: "", trim: true },
    pricePerDay: { type: String, default: "", trim: true },
    languages: [{ type: String, trim: true }],
    specialties: [{ type: String, trim: true }],
    category: { type: String, default: "", trim: true },
    region: { type: String, default: "", trim: true },
    baseCity: { type: String, default: "", trim: true },
    certifications: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTrips: { type: Number, default: 0 },
    phoneNumber: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    whatsapp: { type: String, default: "", trim: true },
    available: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("TourGuide", tourGuideSchema);
