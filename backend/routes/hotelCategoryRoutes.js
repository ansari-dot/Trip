import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createHotelCategory,
  deleteHotelCategory,
  getAllHotelCategories,
  updateHotelCategory,
} from "../controllers/hotelCategoryController.js";

const router = express.Router();

router.get("/", getAllHotelCategories);
router.post("/", authMiddleware, createHotelCategory);
router.put("/:id", authMiddleware, updateHotelCategory);
router.delete("/:id", authMiddleware, deleteHotelCategory);

export default router;
