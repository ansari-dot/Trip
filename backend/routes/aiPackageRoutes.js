import express from "express";
import { getAiPackages } from "../controllers/aiPackageController.js";

const router = express.Router();

router.get("/", getAiPackages);

export default router;
