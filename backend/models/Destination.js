import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    tours: { type: String },
    description: { type: String },
    image: { type: String },
    gallery: [{ type: String }],
    highlights: [{ type: String }],
    price: { type: String },
    duration: { type: String },
    expertTip: { type: String },
    cuisine: { type: String },
    whenToGo: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
});

export default mongoose.model("Destination", destinationSchema);
