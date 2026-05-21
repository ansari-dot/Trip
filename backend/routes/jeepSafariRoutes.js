import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createJeepSafari,
  deleteJeepSafari,
  getAllJeepSafaris,
  getJeepSafariById,
  updateJeepSafari,
} from "../controllers/jeepSafariController.js";

const router = express.Router();

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "galleryFiles", maxCount: 20 },
]);

router.get("/", getAllJeepSafaris);
router.get("/:id", getJeepSafariById);
router.post("/", authMiddleware, uploadFields, createJeepSafari);
router.put("/:id", authMiddleware, uploadFields, updateJeepSafari);
router.delete("/:id", authMiddleware, deleteJeepSafari);

export default router;
