import JeepSafariCategory from "../models/JeepSafariCategory.js";

export const getAllJeepSafariCategories = async (req, res) => {
  try {
    const categories = await JeepSafariCategory.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch jeep safari categories",
    });
  }
};

export const createJeepSafariCategory = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    const trimmedName = String(name).trim();
    const existing = await JeepSafariCategory.findOne({ name: trimmedName });
    if (existing) {
      return res.status(409).json({ success: false, message: "Jeep safari category already exists" });
    }
    const category = await JeepSafariCategory.create({
      name: trimmedName,
      description: description ? String(description).trim() : "",
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });
    res.status(201).json({
      success: true,
      message: "Jeep safari category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create jeep safari category",
    });
  }
};

export const updateJeepSafariCategory = async (req, res) => {
  try {
    const existing = await JeepSafariCategory.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Jeep safari category not found" });
    }
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existing.displayOrder;
    }
    const updated = await JeepSafariCategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      message: "Jeep safari category updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update jeep safari category",
    });
  }
};

export const deleteJeepSafariCategory = async (req, res) => {
  try {
    const deleted = await JeepSafariCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Jeep safari category not found" });
    }
    res.status(200).json({ success: true, message: "Jeep safari category deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete jeep safari category",
    });
  }
};
