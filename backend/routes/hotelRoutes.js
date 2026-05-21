import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createHotel,
  deleteHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
} from "../controllers/hotelController.js";

const router = express.Router();

const hotelUploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "galleryFiles", maxCount: 20 },
  { name: "roomImages", maxCount: 20 },
]);

router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.post("/", authMiddleware, hotelUploadFields, createHotel);
router.put("/:id", authMiddleware, hotelUploadFields, updateHotel);
router.delete("/:id", authMiddleware, deleteHotel);

export default router;
