import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createJeepSafariCategory,
  deleteJeepSafariCategory,
  getAllJeepSafariCategories,
  updateJeepSafariCategory,
} from "../controllers/jeepSafariCategoryController.js";

const router = express.Router();

router.get("/", getAllJeepSafariCategories);
router.post("/", authMiddleware, createJeepSafariCategory);
router.put("/:id", authMiddleware, updateJeepSafariCategory);
router.delete("/:id", authMiddleware, deleteJeepSafariCategory);

export default router;
