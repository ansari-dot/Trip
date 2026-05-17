import express from "express";
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/enquiryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", authMiddleware, getEnquiries);
router.put("/:id", authMiddleware, updateEnquiryStatus);
router.delete("/:id", authMiddleware, deleteEnquiry);

export default router;
