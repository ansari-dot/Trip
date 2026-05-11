import QuoteRequest from "../models/QuoteRequest.js";
import Notification from "../models/Notification.js";
import { sendQuoteEmails } from "../services/emailService.js";

// @desc    Create a new quote request
// @route   POST /api/quotes
// @access  Public
export const createQuoteRequest = async (req, res, next) => {
  try {
    const { name, email, whatsappNumber, destination, travelDates, travelers, message, numberOfDays, serviceType, serviceDetails } = req.body;

    if (!name || !email || !whatsappNumber) {
      return res.status(400).json({ success: false, message: "Name, Email, and WhatsApp number are required" });
    }

    const quote = await QuoteRequest.create({
      name,
      email,
      whatsappNumber,
      destination,
      travelDates,
      travelers,
      message,
      numberOfDays,
      serviceType,
      serviceDetails,
    });

    // Create Notification
    await Notification.create({
      title: "New Quote Request",
      message: `You have a new request from ${name} for ${serviceType || "a general trip"}.`,
      type: "QuoteRequest",
      link: "/quotes",
    });

    // Send Emails (Non-blocking)
    sendQuoteEmails(req.body).catch(err => console.error("Email service error:", err));

    res.status(201).json({
      success: true,
      message: "Admin will contact you shortly.",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quote requests
// @route   GET /api/quotes
// @access  Private/Admin
export const getQuoteRequests = async (req, res, next) => {
  try {
    const quotes = await QuoteRequest.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quote request status
// @route   PUT /api/quotes/:id
// @access  Private/Admin
export const updateQuoteStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!["Pending", "Contacted", "Closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    const quote = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote request not found" });
    }

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quote request
// @route   DELETE /api/quotes/:id
// @access  Private/Admin
export const deleteQuoteRequest = async (req, res, next) => {
  try {
    const quote = await QuoteRequest.findByIdAndDelete(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, message: "Quote request not found" });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
