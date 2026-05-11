import mongoose from "mongoose";

const heroSchema = new mongoose.Schema({
    backgroundImage: { type: String, required: true },
    heading: { type: String, required: true },
    subheading: { type: String },
    description: { type: String },
});

export default mongoose.model("Hero", heroSchema);
