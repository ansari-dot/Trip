import TourPackage from "../models/TourPackage.js";
import { toPackageSummary } from "../services/ai/packageMatcher.js";

/** Lightweight list for trip planner / public catalog (no pagination). */
export const getAiPackages = async (req, res, next) => {
  try {
    const { q } = req.query;
    let packages = await TourPackage.find().sort({ featured: -1, _id: -1 }).lean();

    if (q && String(q).trim()) {
      const term = String(q).toLowerCase();
      packages = packages.filter((pkg) => {
        const hay = [
          pkg.title,
          pkg.type,
          pkg.description,
          ...(pkg.destinations || []),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      });
    }

    res.status(200).json({
      success: true,
      count: packages.length,
      data: packages.map(toPackageSummary),
    });
  } catch (error) {
    next(error);
  }
};
