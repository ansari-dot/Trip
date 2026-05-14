import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createTeamMember,
  deleteTeamMember,
  getAllTeamMembers,
  getTeamMemberById,
  updateTeamMember,
} from "../controllers/teamMemberController.js";

const router = express.Router();

router.get("/", getAllTeamMembers);
router.get("/:id", getTeamMemberById);
router.post("/", authMiddleware, upload.single("image"), createTeamMember);
router.put("/:id", authMiddleware, upload.single("image"), updateTeamMember);
router.delete("/:id", authMiddleware, deleteTeamMember);

export default router;
