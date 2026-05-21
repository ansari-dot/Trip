import Hotel from "../models/Hotel.js";
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

const parseRoomsField = (value, req) => {
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

  const roomImageFiles = req?.files?.roomImages || [];

  return raw
    .map((room, index) => {
      if (!room || typeof room !== "object") return null;
      const name = String(room.name || "").trim();
      if (!name) return null;

      let image = String(room.image || "").trim();
      const uploadedRoomFile = roomImageFiles.find(
        (file) => file.originalname && file.originalname.startsWith(`room-${index}-`)
      );
      if (uploadedRoomFile) {
        image = buildUploadUrl(req, uploadedRoomFile.filename);
      }

      return {
        name,
        description: String(room.description || "").trim(),
        price: String(room.price || "").trim(),
        image,
        capacity: String(room.capacity || "").trim(),
        beds: String(room.beds || "").trim(),
        size: String(room.size || "").trim(),
        amenities: Array.isArray(room.amenities)
          ? room.amenities.map((a) => String(a).trim()).filter(Boolean)
          : [],
      };
    })
    .filter(Boolean);
};

const buildImageUrls = (req, files = []) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  return files.map((file) => buildUploadUrl(req, file.filename)).filter(Boolean);
};

export const createHotel = async (req, res) => {
  try {
    const {
      id,
      name,
      location,
      address,
      category,
      description,
      image,
      priceFrom,
      policies,
      checkIn,
      checkOut,
      phoneNumber,
      email,
      website,
      latitude,
      longitude,
      displayOrder,
      rating,
    } = req.body;

    if (!id || !name || !location) {
      return res.status(400).json({
        success: false,
        message: "id, name, and location are required",
      });
    }

    const existingHotel = await Hotel.findOne({ id });
    if (existingHotel) {
      return res.status(409).json({
        success: false,
        message: "Hotel with this id already exists",
      });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const hotel = await Hotel.create({
      id,
      name,
      location,
      address: address || "",
      category: category || "",
      description: description || "",
      image: primaryImageFile ? buildUploadUrl(req, primaryImageFile.filename) : image || "",
      gallery:
        galleryFiles.length > 0
          ? buildImageUrls(req, galleryFiles)
          : parseArrayField(req.body.gallery),
      priceFrom: priceFrom || "",
      amenities: parseArrayField(req.body.amenities),
      rooms: parseRoomsField(req.body.rooms, req),
      policies: policies || "",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      nearbyAttractions: parseArrayField(req.body.nearbyAttractions),
      phoneNumber: phoneNumber || "",
      email: email || "",
      website: website || "",
      latitude: latitude !== undefined && latitude !== "" ? Number(latitude) : undefined,
      longitude: longitude !== undefined && longitude !== "" ? Number(longitude) : undefined,
      featured: parseBoolean(req.body.featured),
      rating: Number.isFinite(Number(rating)) ? Number(rating) : 0,
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create hotel",
    });
  }
};

export const getAllHotels = async (req, res) => {
  try {
    const featuredOnly = parseBoolean(req.query.featured);

    if (featuredOnly) {
      const featured = await Hotel.find({ featured: true }).sort({
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

    const [hotels, total] = await Promise.all([
      Hotel.find().sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      Hotel.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: hotels.length,
      currentPage: page,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      totalItems: total,
      data: hotels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hotels",
    });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ id: req.params.id });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch hotel",
    });
  }
};

export const updateHotel = async (req, res) => {
  try {
    const existingHotel = await Hotel.findOne({ id: req.params.id });
    if (!existingHotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    const primaryImageFile = req.files?.image?.[0] || null;
    const galleryFiles = req.files?.galleryFiles || [];

    const updateData = { ...req.body };

    if (galleryFiles.length > 0) {
      updateData.gallery = buildImageUrls(req, galleryFiles);
    } else if (req.body.gallery !== undefined) {
      updateData.gallery = parseArrayField(req.body.gallery);
    }

    if (req.body.amenities !== undefined) {
      updateData.amenities = parseArrayField(req.body.amenities);
    }

    if (req.body.nearbyAttractions !== undefined) {
      updateData.nearbyAttractions = parseArrayField(req.body.nearbyAttractions);
    }

    if (req.body.rooms !== undefined) {
      updateData.rooms = parseRoomsField(req.body.rooms, req);
    }

    if (req.body.featured !== undefined) {
      updateData.featured = parseBoolean(req.body.featured);
    }

    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existingHotel.displayOrder;
    }

    if (req.body.rating !== undefined) {
      updateData.rating = Number.isFinite(Number(req.body.rating))
        ? Number(req.body.rating)
        : existingHotel.rating;
    }

    if (req.body.latitude !== undefined && req.body.latitude !== "") {
      updateData.latitude = Number(req.body.latitude);
    }
    if (req.body.longitude !== undefined && req.body.longitude !== "") {
      updateData.longitude = Number(req.body.longitude);
    }

    if (primaryImageFile) {
      updateData.image = buildUploadUrl(req, primaryImageFile.filename);
    }

    const updatedHotel = await Hotel.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: updatedHotel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update hotel",
    });
  }
};

export const deleteHotel = async (req, res) => {
  try {
    const deletedHotel = await Hotel.findOneAndDelete({ id: req.params.id });
    if (!deletedHotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }
    res.status(200).json({ success: true, message: "Hotel deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete hotel",
    });
  }
};
