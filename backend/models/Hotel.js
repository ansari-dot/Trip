import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    capacity: { type: String, default: "", trim: true },
    beds: { type: String, default: "", trim: true },
    size: { type: String, default: "", trim: true },
    amenities: [{ type: String, trim: true }],
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    gallery: [{ type: String }],
    priceFrom: { type: String, default: "", trim: true },
    amenities: [{ type: String, trim: true }],
    rooms: [roomSchema],
    policies: { type: String, default: "", trim: true },
    checkIn: { type: String, default: "", trim: true },
    checkOut: { type: String, default: "", trim: true },
    nearbyAttractions: [{ type: String, trim: true }],
    phoneNumber: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true },
    website: { type: String, default: "", trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    featured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);
