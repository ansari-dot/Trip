import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createTestimonial,
  deleteTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/", getAllTestimonials);
router.get("/:id", getTestimonialById);
router.post("/", authMiddleware, upload.single("image"), createTestimonial);
router.put("/:id", authMiddleware, upload.single("image"), updateTestimonial);
router.delete("/:id", authMiddleware, deleteTestimonial);

export default router;
