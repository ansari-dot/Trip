import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createRentalVehicle,
  deleteRentalVehicle,
  getAllRentalVehicles,
  getRentalVehicleById,
  updateRentalVehicle,
} from "../controllers/rentalVehicleController.js";

const router = express.Router();

router.get("/", getAllRentalVehicles);
router.get("/:id", getRentalVehicleById);
router.post("/", authMiddleware, upload.single("image"), createRentalVehicle);
router.put("/:id", authMiddleware, upload.single("image"), updateRentalVehicle);
router.delete("/:id", authMiddleware, deleteRentalVehicle);

export default router;
