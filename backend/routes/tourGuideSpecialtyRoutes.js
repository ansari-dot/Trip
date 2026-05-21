import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createTourGuideSpecialty,
  deleteTourGuideSpecialty,
  getAllTourGuideSpecialties,
  updateTourGuideSpecialty,
} from "../controllers/tourGuideSpecialtyController.js";

const router = express.Router();

router.get("/", getAllTourGuideSpecialties);
router.post("/", authMiddleware, createTourGuideSpecialty);
router.put("/:id", authMiddleware, updateTourGuideSpecialty);
router.delete("/:id", authMiddleware, deleteTourGuideSpecialty);

export default router;
