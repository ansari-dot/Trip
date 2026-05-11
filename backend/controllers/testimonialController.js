import Testimonial from "../models/Testimonial.js";

const buildImageUrl = (req, fileName) => {
  if (!fileName) {
    return "";
  }

  return `${req.protocol}://${req.get("host")}/uploads/${fileName}`;
};

export const createTestimonial = async (req, res) => {
  try {
    const { quote, name, location, image } = req.body;

    if (!quote || !name) {
      return res.status(400).json({
        success: false,
        message: "quote and name are required",
      });
    }

    const testimonial = await Testimonial.create({
      quote,
      name,
      location,
      image: req.file ? buildImageUrl(req, req.file.filename) : image,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create testimonial",
    });
  }
};

export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ _id: -1 });

    res.status(200).json({
      success: true,
      count: testimonials.length,
      data: testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch testimonials",
    });
  }
};

export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch testimonial",
    });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const existingTestimonial = await Testimonial.findById(req.params.id);

    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    if (req.file) {
      updateData.image = buildImageUrl(req, req.file.filename);
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: updatedTestimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update testimonial",
    });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const deletedTestimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!deletedTestimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete testimonial",
    });
  }
};
