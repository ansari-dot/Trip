import TeamMember from "../models/TeamMember.js";
import { buildUploadUrl } from "../utils/publicUrl.js";

const normalizeSpecialties = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

export const createTeamMember = async (req, res) => {
  try {
    const { name, role, bio, image, displayOrder } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "name and role are required",
      });
    }

    const teamMember = await TeamMember.create({
      name,
      role,
      bio,
      image: req.file ? buildUploadUrl(req, req.file.filename) : image,
      specialties: normalizeSpecialties(req.body.specialties),
      displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
    });

    res.status(201).json({
      success: true,
      message: "Team member created successfully",
      data: teamMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create team member",
    });
  }
};

export const getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await TeamMember.find().sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teamMembers.length,
      data: teamMembers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch team members",
    });
  }
};

export const getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: teamMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch team member",
    });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const existingTeamMember = await TeamMember.findById(req.params.id);

    if (!existingTeamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    const updateData = {
      ...req.body,
      specialties: normalizeSpecialties(req.body.specialties),
    };

    if (req.file) {
      updateData.image = buildUploadUrl(req, req.file.filename);
    }

    if (req.body.displayOrder !== undefined) {
      updateData.displayOrder = Number.isFinite(Number(req.body.displayOrder))
        ? Number(req.body.displayOrder)
        : existingTeamMember.displayOrder;
    }

    const updatedTeamMember = await TeamMember.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      data: updatedTeamMember,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update team member",
    });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const deletedTeamMember = await TeamMember.findByIdAndDelete(req.params.id);

    if (!deletedTeamMember) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete team member",
    });
  }
};
