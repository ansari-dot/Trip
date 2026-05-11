import mongoose from "mongoose";

const tourPackageSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    destinations: [{ type: String }],
    duration: { type: String },
    price: { type: String },
    image: { type: String },
    type: { type: String },
    description: { type: String },
    itinerary: [
        {
            day: { type: String },
            title: { type: String },
            description: { type: String },
        },
    ],
    tourPackages: [
        {
            tier: { type: String },
            price: { type: String },
            description: { type: String },
        },
    ],
    featured: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false },
    gallery: [{ type: String }],
});

export default mongoose.model("TourPackage", tourPackageSchema);
