import Destination from "../models/Destination.js";
import { buildUploadUrl } from "../utils/publicUrl.js";

const parseArrayField = (value, fallback = []) => {
  if (!value) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
};

const buildImageUrls = (req, files = []) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  return files.map((file) => buildUploadUrl(req, file.filename)).filter(Boolean);
};

export const createDestination = async (req, res) => {
  try {
    const {
      id,
      name,
      location,
      tours,
      description,
      image,
      price,
      duration,
      expertTip,
      cuisine,
      whenToGo,
      latitude,
      longitude,
    } = req.body;

    if (!id || !name || !location) {
      return res.status(400).json({
        success: false,
        message: "id, name, and location are required",
      });
    }

    const existingDestination = await Destination.findOne({ id });

    if (existingDestination) {
      return res.status(409).json({
        success: false,
        message: "Destination with this id already exists",
      });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const destination = await Destination.create({
      id,
      name,
      location,
      tours,
      description,
      image: primaryImageFile ? buildUploadUrl(req, primaryImageFile.filename) : image,
      gallery: galleryFiles.length > 0 ? buildImageUrls(req, galleryFiles) : parseArrayField(req.body.gallery),
      highlights: parseArrayField(req.body.highlights),
      price,
      duration,
      expertTip,
      cuisine,
      whenToGo,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: destination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create destination",
    });
  }
};

export const getAllDestinations = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 6;
    const skip = (page - 1) * limit;

    const [destinations, total] = await Promise.all([
      Destination.find().sort({ _id: -1 }).skip(skip).limit(limit),
      Destination.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: destinations.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: destinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch destinations",
    });
  }
};

export const getFeaturedDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ _id: -1 }).limit(3);

    res.status(200).json({
      success: true,
      count: destinations.length,
      data: destinations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch featured destinations",
    });
  }
};

export const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findOne({ id: req.params.id });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch destination",
    });
  }
};

export const updateDestination = async (req, res) => {
  try {
    const existingDestination = await Destination.findOne({ id: req.params.id });

    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const updateData = {
      ...req.body,
    };

    if (galleryFiles.length > 0) {
      updateData.gallery = buildImageUrls(req, galleryFiles);
    } else if (req.body.gallery !== undefined) {
      updateData.gallery = parseArrayField(req.body.gallery);
    }

    if (req.body.highlights !== undefined) {
      updateData.highlights = parseArrayField(req.body.highlights);
    }

    if (primaryImageFile) {
      updateData.image = buildUploadUrl(req, primaryImageFile.filename);
    }

    const updatedDestination = await Destination.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: updatedDestination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update destination",
    });
  }
};

export const deleteDestination = async (req, res) => {
  try {
    const deletedDestination = await Destination.findOneAndDelete({ id: req.params.id });

    if (!deletedDestination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Destination deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete destination",
    });
  }
};
