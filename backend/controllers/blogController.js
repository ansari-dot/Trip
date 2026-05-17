import Blog from "../models/Blog.js";
import { buildUploadUrl } from "../utils/publicUrl.js";

const parseArrayField = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return String(value)
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

export const createBlog = async (req, res) => {
  try {
    const {
      id,
      title,
      excerpt,
      content,
      image,
      category,
      author,
      seoTitle,
      seoDescription,
      seoKeywords,
      publishedAt,
    } = req.body;

    if (!id || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "id, title, and content are required",
      });
    }

    const existingBlog = await Blog.findOne({ id });
    if (existingBlog) {
      return res.status(409).json({
        success: false,
        message: "Blog with this id already exists",
      });
    }

    const blog = await Blog.create({
      id,
      title,
      excerpt,
      content,
      image: req.file ? buildUploadUrl(req, req.file.filename) : image,
      category,
      author,
      tags: parseArrayField(req.body.tags),
      seoTitle,
      seoDescription,
      seoKeywords,
      publishedAt: publishedAt || Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create blog",
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const requestedLimit = Number(req.query.limit);
    const limit = Math.max(requestedLimit || 6, 1);
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find().sort({ publishedAt: -1, _id: -1 }).skip(skip).limit(limit),
      Blog.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      count: blogs.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: blogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs",
    });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ id: req.params.id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog",
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const existingBlog = await Blog.findOne({ id: req.params.id });

    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const updateData = {
      ...req.body,
    };

    if (req.body.tags !== undefined) {
      updateData.tags = parseArrayField(req.body.tags);
    }

    if (req.file) {
      updateData.image = buildUploadUrl(req, req.file.filename);
    }

    const updatedBlog = await Blog.findOneAndUpdate({ id: req.params.id }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog",
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findOneAndDelete({ id: req.params.id });

    if (!deletedBlog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete blog",
    });
  }
};
