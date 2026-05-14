import RentalVehicle from "../models/RentalVehicle.js";

const buildImageUrl = (req, fileName) => {
  if (!fileName) return "";
  return `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
};

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
      image: req.file ? buildImageUrl(req, req.file.filename) : image,
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
    const vehicles = await RentalVehicle.find().sort({ displayOrder: 1, createdAt: -1 });
    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
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
    if (req.file) updateData.image = buildImageUrl(req, req.file.filename);

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
