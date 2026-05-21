import RentalVehicle from "../models/RentalVehicle.js";
import { buildUploadUrl } from "../utils/publicUrl.js";

const parseArrayField = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return String(value)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const parseBoolean = (value) => value === true || value === "true" || value === "1" || value === 1;

export const createRentalVehicle = async (req, res) => {
  try {
    const { id, name, type, price, image, description, seats, transmission, fuelType, displayOrder } = req.body;

    if (!id || !name) {
      return res.status(400).json({ success: false, message: "id and name are required" });
    }

    const existingVehicle = await RentalVehicle.findOne({ id });
    if (existingVehicle) {
      return res.status(409).json({ success: false, message: "Rental vehicle with this id already exists" });
    }

    const vehicle = await RentalVehicle.create({
      id,
      name,
      type,
      price,
      image: req.file ? buildUploadUrl(req, req.file.filename) : image,
      description,
      seats,
      transmission,
      fuelType,
      withDriver: parseBoolean(req.body.withDriver),
      features: parseArrayField(req.body.features),
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });

    res.status(201).json({ success: true, message: "Rental vehicle created successfully", data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to create rental vehicle" });
  }
};

export const getAllRentalVehicles = async (req, res) => {
  try {
    const featuredOnly = parseBoolean(req.query.featured);

    if (featuredOnly) {
      const featured = await RentalVehicle.find({ withDriver: true }).sort({
        displayOrder: 1,
        createdAt: -1,
      });
      return res.status(200).json({
        success: true,
        count: featured.length,
        totalItems: featured.length,
        data: featured,
      });
    }

    if (req.query.page === undefined && req.query.limit === undefined) {
      const vehicles = await RentalVehicle.find().sort({ displayOrder: 1, createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: vehicles.length,
        totalItems: vehicles.length,
        data: vehicles,
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 9, 1);
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
      RentalVehicle.find().sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      RentalVehicle.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: vehicles.length,
      currentPage: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalItems: total,
      data: vehicles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch rental vehicles" });
  }
};

export const getRentalVehicleById = async (req, res) => {
  try {
    const vehicle = await RentalVehicle.findOne({ id: req.params.id });
    if (!vehicle) return res.status(404).json({ success: false, message: "Rental vehicle not found" });
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch rental vehicle" });
  }
};

export const updateRentalVehicle = async (req, res) => {
  try {
    const existingVehicle = await RentalVehicle.findOne({ id: req.params.id });
    if (!existingVehicle) return res.status(404).json({ success: false, message: "Rental vehicle not found" });

    const updateData = { ...req.body };
    if (req.body.features !== undefined) updateData.features = parseArrayField(req.body.features);
    if (req.body.withDriver !== undefined) updateData.withDriver = parseBoolean(req.body.withDriver);
    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existingVehicle.displayOrder;
    }
    if (req.file) updateData.image = buildUploadUrl(req, req.file.filename);

    const updatedVehicle = await RentalVehicle.findOneAndUpdate({ id: req.params.id }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "Rental vehicle updated successfully", data: updatedVehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update rental vehicle" });
  }
};

export const deleteRentalVehicle = async (req, res) => {
  try {
    const deletedVehicle = await RentalVehicle.findOneAndDelete({ id: req.params.id });
    if (!deletedVehicle) return res.status(404).json({ success: false, message: "Rental vehicle not found" });
    res.status(200).json({ success: true, message: "Rental vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete rental vehicle" });
  }
};
