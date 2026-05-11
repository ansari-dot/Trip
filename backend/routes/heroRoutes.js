import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import { createHero, deleteHero, getAllHeroes, updateHero } from "../controllers/heroController.js";

const router = express.Router();

router.get("/", getAllHeroes);
router.post("/", authMiddleware, upload.single("backgroundImage"), createHero);
router.put("/:id", authMiddleware, upload.single("backgroundImage"), updateHero);
router.delete("/:id", authMiddleware, deleteHero);

export default router;
