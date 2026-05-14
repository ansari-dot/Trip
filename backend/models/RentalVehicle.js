import mongoose from "mongoose";

const rentalVehicleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "", trim: true },
    price: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    description: { type: String, default: "", trim: true },
    seats: { type: String, default: "", trim: true },
    transmission: { type: String, default: "", trim: true },
    fuelType: { type: String, default: "", trim: true },
    withDriver: { type: Boolean, default: false },
    features: [{ type: String, trim: true }],
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RentalVehicle", rentalVehicleSchema);
