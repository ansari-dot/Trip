import Hero from "../models/Hero.js";
import { buildUploadUrl } from "../utils/publicUrl.js";

export const createHero = async (req, res) => {
  try {
    const { heading, subheading, description, backgroundImage } = req.body;
    if (!heading || (!backgroundImage && !req.file)) {
      return res.status(400).json({ success: false, message: "heading and backgroundImage are required" });
    }
    const hero = await Hero.create({
      heading,
      subheading,
      description,
      backgroundImage: req.file ? buildUploadUrl(req, req.file.filename) : backgroundImage,
    });
    res.status(201).json({ success: true, message: "Hero slide created successfully", data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to create hero slide" });
  }
};

export const getAllHeroes = async (req, res) => {
  try {
    const heroes = await Hero.find().sort({ _id: -1 });
    res.status(200).json({ success: true, count: heroes.length, data: heroes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch hero slides" });
  }
};

export const updateHero = async (req, res) => {
  try {
    const existing = await Hero.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Hero slide not found" });

    const updateData = { ...req.body };
    if (req.file) updateData.backgroundImage = buildUploadUrl(req, req.file.filename);

    const updated = await Hero.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Hero slide updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update hero slide" });
  }
};

export const deleteHero = async (req, res) => {
  try {
    const deleted = await Hero.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Hero slide not found" });
    res.status(200).json({ success: true, message: "Hero slide deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete hero slide" });
  }
};
