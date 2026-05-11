import TourType from "../models/TourType.js";

export const getAllTourTypes = async (req, res) => {
  try {
    const tourTypes = await TourType.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: tourTypes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tour types",
    });
  }
};

export const createTourType = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const existing = await TourType.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, message: "Tour type already exists" });
    }

    const tourType = await TourType.create({ name, description });
    res.status(201).json({
      success: true,
      message: "Tour type created successfully",
      data: tourType,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tour type",
    });
  }
};

export const deleteTourType = async (req, res) => {
  try {
    const deleted = await TourType.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Tour type not found" });
    }
    res.status(200).json({
      success: true,
      message: "Tour type deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete tour type",
    });
  }
};
