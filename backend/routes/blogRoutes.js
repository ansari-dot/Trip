import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/", authMiddleware, upload.single("image"), createBlog);
router.put("/:id", authMiddleware, upload.single("image"), updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);

export default router;
