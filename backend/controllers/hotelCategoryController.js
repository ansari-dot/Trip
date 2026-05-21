import HotelCategory from "../models/HotelCategory.js";

export const getAllHotelCategories = async (req, res) => {
  try {
    const categories = await HotelCategory.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hotel categories",
    });
  }
};

export const createHotelCategory = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const trimmedName = String(name).trim();
    const existing = await HotelCategory.findOne({ name: trimmedName });
    if (existing) {
      return res.status(409).json({ success: false, message: "Hotel category already exists" });
    }

    const category = await HotelCategory.create({
      name: trimmedName,
      description: description ? String(description).trim() : "",
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Hotel category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create hotel category",
    });
  }
};

export const updateHotelCategory = async (req, res) => {
  try {
    const existing = await HotelCategory.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Hotel category not found" });
    }

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existing.displayOrder;
    }

    const updated = await HotelCategory.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Hotel category updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update hotel category",
    });
  }
};

export const deleteHotelCategory = async (req, res) => {
  try {
    const deleted = await HotelCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Hotel category not found" });
    }
    res.status(200).json({
      success: true,
      message: "Hotel category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete hotel category",
    });
  }
};
