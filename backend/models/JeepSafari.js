import mongoose from "mongoose";

const itineraryStepSchema = new mongoose.Schema(
  {
    day: { type: String, default: "", trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const jeepSafariSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    region: { type: String, default: "", trim: true },
    duration: { type: String, default: "", trim: true },
    pricePerPerson: { type: String, default: "", trim: true },
    pricePerJeep: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    gallery: [{ type: String }],
    description: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    difficulty: { type: String, default: "", trim: true },
    vehicleType: { type: String, default: "", trim: true },
    maxGroupSize: { type: String, default: "", trim: true },
    bestSeason: { type: String, default: "", trim: true },
    startLocation: { type: String, default: "", trim: true },
    endLocation: { type: String, default: "", trim: true },
    meetingPoint: { type: String, default: "", trim: true },
    highlights: [{ type: String, trim: true }],
    includes: [{ type: String, trim: true }],
    excludes: [{ type: String, trim: true }],
    itinerary: [itineraryStepSchema],
    nearbyAttractions: [{ type: String, trim: true }],
    latitude: { type: Number },
    longitude: { type: Number },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("JeepSafari", jeepSafariSchema);
