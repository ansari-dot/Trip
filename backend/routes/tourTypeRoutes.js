import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createTourType,
  deleteTourType,
  getAllTourTypes,
} from "../controllers/tourTypeController.js";

const router = express.Router();

router.get("/", getAllTourTypes);
router.post("/", authMiddleware, createTourType);
router.delete("/:id", authMiddleware, deleteTourType);

export default router;
