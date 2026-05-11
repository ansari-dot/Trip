import express from "express";
import { getCurrentAdmin, login, logout } from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", authMiddleware, getCurrentAdmin);
router.post("/logout", authMiddleware, logout);

export default router;
