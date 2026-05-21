import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createVehicleCategory,
  deleteVehicleCategory,
  getAllVehicleCategories,
  updateVehicleCategory,
} from "../controllers/vehicleCategoryController.js";

const router = express.Router();

router.get("/", getAllVehicleCategories);
router.post("/", authMiddleware, createVehicleCategory);
router.put("/:id", authMiddleware, updateVehicleCategory);
router.delete("/:id", authMiddleware, deleteVehicleCategory);

export default router;
