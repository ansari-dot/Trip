import express from "express";
import {
  createQuoteRequest,
  getQuoteRequests,
  updateQuoteStatus,
  deleteQuoteRequest,
} from "../controllers/quoteRequestController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(createQuoteRequest)
  .get(authMiddleware, getQuoteRequests);

router.route("/:id")
  .put(authMiddleware, updateQuoteStatus)
  .delete(authMiddleware, deleteQuoteRequest);

export default router;
