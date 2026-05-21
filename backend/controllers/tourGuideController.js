import TourGuide from "../models/TourGuide.js";
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

const buildImageUrls = (req, files = []) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return files.map((file) => buildUploadUrl(req, file.filename)).filter(Boolean);
};

export const createTourGuide = async (req, res) => {
  try {
    const {
      id,
      name,
      image,
      shortBio,
      bio,
      experience,
      pricePerDay,
      category,
      region,
      baseCity,
      rating,
      totalTrips,
      phoneNumber,
      email,
      whatsapp,
      displayOrder,
    } = req.body;

    if (!id || !name) {
      return res.status(400).json({ success: false, message: "id and name are required" });
    }

    const existing = await TourGuide.findOne({ id });
    if (existing) {
      return res.status(409).json({ success: false, message: "Tour guide with this id already exists" });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const guide = await TourGuide.create({
      id,
      name,
      image: primaryImageFile ? buildUploadUrl(req, primaryImageFile.filename) : image || "",
      gallery:
        galleryFiles.length > 0
          ? buildImageUrls(req, galleryFiles)
          : parseArrayField(req.body.gallery),
      shortBio: shortBio || "",
      bio: bio || "",
      experience: experience || "",
      pricePerDay: pricePerDay || "",
      languages: parseArrayField(req.body.languages),
      specialties: parseArrayField(req.body.specialties),
      category: category || "",
      region: region || "",
      baseCity: baseCity || "",
      certifications: parseArrayField(req.body.certifications),
      rating: Number.isFinite(Number(rating)) ? Number(rating) : 0,
      totalTrips: Number.isFinite(Number(totalTrips)) ? Number(totalTrips) : 0,
      phoneNumber: phoneNumber || "",
      email: email || "",
      whatsapp: whatsapp || "",
      available: req.body.available !== undefined ? parseBoolean(req.body.available) : true,
      featured: parseBoolean(req.body.featured),
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Tour guide created successfully",
      data: guide,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tour guide",
    });
  }
};

export const getAllTourGuides = async (req, res) => {
  try {
    const featuredOnly = parseBoolean(req.query.featured);

    if (featuredOnly) {
      const featured = await TourGuide.find({ featured: true }).sort({
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

    const [guides, total] = await Promise.all([
      TourGuide.find().sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      TourGuide.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: guides.length,
      currentPage: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalItems: total,
      data: guides,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tour guides",
    });
  }
};

export const getTourGuideById = async (req, res) => {
  try {
    const guide = await TourGuide.findOne({ id: req.params.id });
    if (!guide) {
      return res.status(404).json({ success: false, message: "Tour guide not found" });
    }
    res.status(200).json({ success: true, data: guide });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tour guide",
    });
  }
};

export const updateTourGuide = async (req, res) => {
  try {
    const existing = await TourGuide.findOne({ id: req.params.id });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Tour guide not found" });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const updateData = { ...req.body };

    if (galleryFiles.length > 0) {
      updateData.gallery = buildImageUrls(req, galleryFiles);
    } else if (req.body.gallery !== undefined) {
      updateData.gallery = parseArrayField(req.body.gallery);
    }

    if (req.body.languages !== undefined) updateData.languages = parseArrayField(req.body.languages);
    if (req.body.specialties !== undefined) updateData.specialties = parseArrayField(req.body.specialties);
    if (req.body.certifications !== undefined)
      updateData.certifications = parseArrayField(req.body.certifications);
    if (req.body.featured !== undefined) updateData.featured = parseBoolean(req.body.featured);
    if (req.body.available !== undefined) updateData.available = parseBoolean(req.body.available);

    if (req.body.rating !== undefined) {
      updateData.rating = Number.isFinite(Number(req.body.rating))
        ? Number(req.body.rating)
        : existing.rating;
    }
    if (req.body.totalTrips !== undefined) {
      updateData.totalTrips = Number.isFinite(Number(req.body.totalTrips))
        ? Number(req.body.totalTrips)
        : existing.totalTrips;
    }
    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existing.displayOrder;
    }

    if (primaryImageFile) updateData.image = buildUploadUrl(req, primaryImageFile.filename);

    const updated = await TourGuide.findOneAndUpdate({ id: req.params.id }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Tour guide updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update tour guide",
    });
  }
};

export const deleteTourGuide = async (req, res) => {
  try {
    const deleted = await TourGuide.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Tour guide not found" });
    }
    res.status(200).json({ success: true, message: "Tour guide deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete tour guide",
    });
  }
};
