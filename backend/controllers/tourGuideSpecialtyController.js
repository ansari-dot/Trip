import TourGuideSpecialty from "../models/TourGuideSpecialty.js";

export const getAllTourGuideSpecialties = async (req, res) => {
  try {
    const items = await TourGuideSpecialty.find().sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tour guide specialties",
    });
  }
};

export const createTourGuideSpecialty = async (req, res) => {
  try {
    const { name, description, displayOrder } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    const trimmedName = String(name).trim();
    const existing = await TourGuideSpecialty.findOne({ name: trimmedName });
    if (existing) {
      return res.status(409).json({ success: false, message: "Specialty already exists" });
    }
    const item = await TourGuideSpecialty.create({
      name: trimmedName,
      description: description ? String(description).trim() : "",
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });
    res.status(201).json({
      success: true,
      message: "Specialty created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create specialty",
    });
  }
};

export const updateTourGuideSpecialty = async (req, res) => {
  try {
    const existing = await TourGuideSpecialty.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Specialty not found" });
    }
    const updateData = {};
    if (req.body.name !== undefined) updateData.name = String(req.body.name).trim();
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existing.displayOrder;
    }
    const updated = await TourGuideSpecialty.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      message: "Specialty updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update specialty",
    });
  }
};

export const deleteTourGuideSpecialty = async (req, res) => {
  try {
    const deleted = await TourGuideSpecialty.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Specialty not found" });
    }
    res.status(200).json({ success: true, message: "Specialty deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete specialty",
    });
  }
};
