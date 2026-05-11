import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema({
    quote: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String },
    image: { type: String },
});

export default mongoose.model("Testimonial", testimonialSchema);
