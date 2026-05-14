import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, default: "", trim: true },
    image: { type: String, default: "" },
    specialties: [{ type: String, trim: true }],
    displayOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TeamMember", teamMemberSchema);
