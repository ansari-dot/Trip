import TourPackage from "../models/TourPackage.js";
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

export const createTourPackage = async (req, res) => {
  try {
    const {
      id,
      title,
      duration,
      price,
      type,
      description,
      image,
    } = req.body;

    if (!id || !title) {
      return res.status(400).json({
        success: false,
        message: "id and title are required",
      });
    }

    const existingTourPackage = await TourPackage.findOne({ id });

    if (existingTourPackage) {
      return res.status(409).json({
        success: false,
        message: "Tour package with this id already exists",
      });
    }

    const galleryUrls = [];
    if (req.files && req.files.gallery) {
      req.files.gallery.forEach(file => {
        galleryUrls.push(buildUploadUrl(req, file.filename));
      });
    }

    const tourPackage = await TourPackage.create({
      id,
      title,
      destinations: parseArrayField(req.body.destinations),
      duration,
      price,
      image: (req.files && req.files.image) ? buildUploadUrl(req, req.files.image[0].filename) : image,
      type,
      description,
      itinerary: parseArrayField(req.body.itinerary),
      tourPackages: parseArrayField(req.body.tourPackages),
      gallery: galleryUrls.length > 0 ? galleryUrls : parseArrayField(req.body.gallery),
    });

    res.status(201).json({
      success: true,
      message: "Tour package created successfully",
      data: tourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tour package",
    });
  }
};

export const getAllTourPackages = async (req, res) => {
  try {
    const { type, isSeasonal } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (isSeasonal !== undefined) filter.isSeasonal = isSeasonal === 'true';
    
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = 6;
    const skip = (page - 1) * limit;

    const [tourPackages, total] = await Promise.all([
      TourPackage.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
      TourPackage.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: tourPackages.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: tourPackages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tour packages",
    });
  }
};

export const getFeaturedTourPackages = async (req, res) => {
  try {
    const tourPackages = await TourPackage.find({ featured: true }).sort({ _id: -1 });

    res.status(200).json({
      success: true,
      count: tourPackages.length,
      data: tourPackages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch featured tour packages",
    });
  }
};

export const getTourPackageById = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findOne({ id: req.params.id });

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tour package",
    });
  }
};

export const updateTourPackage = async (req, res) => {
  try {
    const existingTourPackage = await TourPackage.findOne({ id: req.params.id });

    if (!existingTourPackage) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    if (req.body.destinations !== undefined) {
      updateData.destinations = parseArrayField(req.body.destinations);
    }

    if (req.body.itinerary !== undefined) {
      updateData.itinerary = parseArrayField(req.body.itinerary);
    }

    if (req.body.tourPackages !== undefined) {
      updateData.tourPackages = parseArrayField(req.body.tourPackages);
    }

    if (req.files) {
      if (req.files.image) {
        updateData.image = buildUploadUrl(req, req.files.image[0].filename);
      }
      if (req.files.gallery) {
        const existingGallery = parseArrayField(req.body.gallery);
        const newGallery = req.files.gallery.map(file => buildUploadUrl(req, file.filename));
        updateData.gallery = [...existingGallery, ...newGallery];
      }
    } else if (req.body.gallery !== undefined) {
      updateData.gallery = parseArrayField(req.body.gallery);
    }

    const updatedTourPackage = await TourPackage.findOneAndUpdate(
      { id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Tour package updated successfully",
      data: updatedTourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update tour package",
    });
  }
};

export const deleteTourPackage = async (req, res) => {
  try {
    const deletedTourPackage = await TourPackage.findOneAndDelete({ id: req.params.id });

    if (!deletedTourPackage) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Tour package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete tour package",
    });
  }
};

export const toggleFeaturedTourPackage = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findOne({ id: req.params.id });

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    tourPackage.featured = !tourPackage.featured;
    await tourPackage.save();

    res.status(200).json({
      success: true,
      message: `Tour package ${tourPackage.featured ? "added to" : "removed from"} featured tours`,
      data: tourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle featured status",
    });
  }
};

export const toggleSeasonalTourPackage = async (req, res) => {
  try {
    const tourPackage = await TourPackage.findOne({ id: req.params.id });

    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    tourPackage.isSeasonal = !tourPackage.isSeasonal;
    await tourPackage.save();

    res.status(200).json({
      success: true,
      message: `Tour package ${tourPackage.isSeasonal ? "added to" : "removed from"} seasonal tours`,
      data: tourPackage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle seasonal status",
    });
  }
};
