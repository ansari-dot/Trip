import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import { getPromoModal, updatePromoModal } from "../controllers/promoModalController.js";

const router = express.Router();

router.get("/", getPromoModal);
router.put("/", authMiddleware, upload.single("image"), updatePromoModal);

export default router;
