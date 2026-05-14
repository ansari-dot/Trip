import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "", trim: true },
    content: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    category: { type: String, default: "", trim: true },
    author: { type: String, default: "", trim: true },
    tags: [{ type: String, trim: true }],
    seoTitle: { type: String, default: "", trim: true },
    seoDescription: { type: String, default: "", trim: true },
    seoKeywords: { type: String, default: "", trim: true },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Blog", blogSchema);
