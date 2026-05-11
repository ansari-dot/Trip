import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";
import {
  createDestination,
  deleteDestination,
  getAllDestinations,
  getDestinationById,
  getFeaturedDestinations,
  updateDestination,
} from "../controllers/destinationController.js";

const router = express.Router();

router.get("/", getAllDestinations);
router.get("/featured", getFeaturedDestinations);
router.get("/:id", getDestinationById);
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "galleryFiles", maxCount: 12 },
  ]),
  createDestination
);
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "galleryFiles", maxCount: 12 },
  ]),
  updateDestination
);
router.delete("/:id", authMiddleware, deleteDestination);

export default router;
