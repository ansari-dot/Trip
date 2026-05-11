import mongoose from "mongoose";

const promoModalSchema = new mongoose.Schema({
    image: { type: String, required: true },
    subtitle: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true }
});

export default mongoose.model("PromoModal", promoModalSchema);
