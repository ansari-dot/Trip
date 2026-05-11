import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createTourPackage,
  deleteTourPackage,
  getAllTourPackages,
  getFeaturedTourPackages,
  getTourPackageById,
  updateTourPackage,
  toggleFeaturedTourPackage,
  toggleSeasonalTourPackage,
} from "../controllers/tourPackageController.js";

const router = express.Router();

router.get("/", getAllTourPackages);
router.get("/featured", getFeaturedTourPackages);
router.get("/:id", getTourPackageById);
router.patch("/:id/featured", authMiddleware, toggleFeaturedTourPackage);
router.patch("/:id/seasonal", authMiddleware, toggleSeasonalTourPackage);
router.post("/", authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), createTourPackage);
router.put("/:id", authMiddleware, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), updateTourPackage);
router.delete("/:id", authMiddleware, deleteTourPackage);

export default router;
