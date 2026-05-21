import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createTourGuide,
  deleteTourGuide,
  getAllTourGuides,
  getTourGuideById,
  updateTourGuide,
} from "../controllers/tourGuideController.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "galleryFiles", maxCount: 20 },
]);

router.get("/", getAllTourGuides);
router.get("/:id", getTourGuideById);
router.post("/", authMiddleware, uploadFields, createTourGuide);
router.put("/:id", authMiddleware, uploadFields, updateTourGuide);
router.delete("/:id", authMiddleware, deleteTourGuide);

export default router;
