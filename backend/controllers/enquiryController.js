import Enquiry from "../models/Enquiry.js";
import Notification from "../models/Notification.js";

export const createEnquiry = async (req, res, next) => {
  try {
    const { name, phone, message, type } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const enquiry = await Enquiry.create({
      name: String(name).trim(),
      phone: String(phone).trim(),
      message: message ? String(message).trim() : "",
      type: type ? String(type).trim() : "ai-chat",
      source: "trip-planner",
    });

    await Notification.create({
      title: "New AI Trip Planner enquiry",
      message: `${enquiry.name} shared contact via trip planner.`,
      type: "Enquiry",
      link: "/enquiries",
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Thank you. Our team will contact you shortly.",
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "Contacted", "Closed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Enquiry deleted",
    });
  } catch (error) {
    next(error);
  }
};
