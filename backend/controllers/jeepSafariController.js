import JeepSafari from "../models/JeepSafari.js";
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

const parseBoolean = (value) =>
  value === true || value === "true" || value === "1" || value === 1;

const parseItinerary = (value) => {
  if (!value) return [];
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw
    .map((step) => {
      if (!step || typeof step !== "object") return null;
      const title = String(step.title || "").trim();
      if (!title) return null;
      return {
        day: String(step.day || "").trim(),
        title,
        description: String(step.description || "").trim(),
      };
    })
    .filter(Boolean);
};

const buildImageUrls = (req, files = []) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return files.map((file) => buildUploadUrl(req, file.filename)).filter(Boolean);
};

export const createJeepSafari = async (req, res) => {
  try {
    const {
      id,
      name,
      region,
      duration,
      pricePerPerson,
      pricePerJeep,
      image,
      description,
      category,
      difficulty,
      vehicleType,
      maxGroupSize,
      bestSeason,
      startLocation,
      endLocation,
      meetingPoint,
      latitude,
      longitude,
      displayOrder,
    } = req.body;

    if (!id || !name) {
      return res.status(400).json({ success: false, message: "id and name are required" });
    }

    const existing = await JeepSafari.findOne({ id });
    if (existing) {
      return res.status(409).json({ success: false, message: "Jeep safari with this id already exists" });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const safari = await JeepSafari.create({
      id,
      name,
      region: region || "",
      duration: duration || "",
      pricePerPerson: pricePerPerson || "",
      pricePerJeep: pricePerJeep || "",
      image: primaryImageFile ? buildUploadUrl(req, primaryImageFile.filename) : image || "",
      gallery:
        galleryFiles.length > 0
          ? buildImageUrls(req, galleryFiles)
          : parseArrayField(req.body.gallery),
      description: description || "",
      category: category || "",
      difficulty: difficulty || "",
      vehicleType: vehicleType || "",
      maxGroupSize: maxGroupSize || "",
      bestSeason: bestSeason || "",
      startLocation: startLocation || "",
      endLocation: endLocation || "",
      meetingPoint: meetingPoint || "",
      highlights: parseArrayField(req.body.highlights),
      includes: parseArrayField(req.body.includes),
      excludes: parseArrayField(req.body.excludes),
      itinerary: parseItinerary(req.body.itinerary),
      nearbyAttractions: parseArrayField(req.body.nearbyAttractions),
      latitude: latitude !== undefined && latitude !== "" ? Number(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== "" ? Number(longitude) : undefined,
      featured: parseBoolean(req.body.featured),
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Jeep safari created successfully",
      data: safari,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create jeep safari",
    });
  }
};

export const getAllJeepSafaris = async (req, res) => {
  try {
    const featuredOnly = parseBoolean(req.query.featured);

    if (featuredOnly) {
      const featured = await JeepSafari.find({ featured: true }).sort({
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

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 9, 1);
    const skip = (page - 1) * limit;

    const [safaris, total] = await Promise.all([
      JeepSafari.find().sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      JeepSafari.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: safaris.length,
      currentPage: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalItems: total,
      data: safaris,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch jeep safaris",
    });
  }
};

export const getJeepSafariById = async (req, res) => {
  try {
    const safari = await JeepSafari.findOne({ id: req.params.id });
    if (!safari) {
      return res.status(404).json({ success: false, message: "Jeep safari not found" });
    }
    res.status(200).json({ success: true, data: safari });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch jeep safari",
    });
  }
};

export const updateJeepSafari = async (req, res) => {
  try {
    const existing = await JeepSafari.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Jeep safari not found" });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const updateData = { ...req.body };

    if (galleryFiles.length > 0) {
      updateData.gallery = buildImageUrls(req, galleryFiles);
    } else if (req.body.gallery !== undefined) {
      updateData.gallery = parseArrayField(req.body.gallery);
    }

    if (req.body.highlights !== undefined) updateData.highlights = parseArrayField(req.body.highlights);
    if (req.body.includes !== undefined) updateData.includes = parseArrayField(req.body.includes);
    if (req.body.excludes !== undefined) updateData.excludes = parseArrayField(req.body.excludes);
    if (req.body.nearbyAttractions !== undefined)
      updateData.nearbyAttractions = parseArrayField(req.body.nearbyAttractions);
    if (req.body.itinerary !== undefined) updateData.itinerary = parseItinerary(req.body.itinerary);
    if (req.body.featured !== undefined) updateData.featured = parseBoolean(req.body.featured);

    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existing.displayOrder;
    }
    if (req.body.latitude !== undefined && req.body.latitude !== "") {
      updateData.latitude = Number(req.body.latitude);
    }
    if (req.body.longitude !== undefined && req.body.longitude !== "") {
      updateData.longitude = Number(req.body.longitude);
    }

    if (primaryImageFile) updateData.image = buildUploadUrl(req, primaryImageFile.filename);

    const updated = await JeepSafari.findOneAndUpdate({ id: req.params.id }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Jeep safari updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update jeep safari",
    });
  }
};

export const deleteJeepSafari = async (req, res) => {
  try {
    const deleted = await JeepSafari.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Jeep safari not found" });
    }
    res.status(200).json({ success: true, message: "Jeep safari deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete jeep safari",
    });
  }
};
