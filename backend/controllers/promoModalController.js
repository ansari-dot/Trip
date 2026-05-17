import PromoModal from "../models/PromoModal.js";
import { buildUploadUrl } from "../utils/publicUrl.js";

export const getPromoModal = async (req, res) => {
  try {
    let promo = await PromoModal.findOne();
    if (!promo) {
      promo = await PromoModal.create({
        image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000",
        subtitle: "Special Offer",
        title: "Trending Packages",
        description: "Unlock exclusive discounts on our most popular destinations. Book your dream getaway today and experience luxury like never before.",
        isActive: true
      });
    }
    res.status(200).json({ success: true, data: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch promo modal" });
  }
};

export const updatePromoModal = async (req, res) => {
  try {
    let promo = await PromoModal.findOne();
    
    const updateData = { ...req.body };
    // Handle boolean conversion for form-data
    if (updateData.isActive === 'true') updateData.isActive = true;
    if (updateData.isActive === 'false') updateData.isActive = false;

    if (req.file) {
      updateData.image = buildUploadUrl(req, req.file.filename);
    }

    if (!promo) {
      promo = await PromoModal.create({
        image: updateData.image || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&q=80&w=1000",
        subtitle: updateData.subtitle || "Special Offer",
        title: updateData.title || "Trending Packages",
        description: updateData.description || "Unlock exclusive discounts on our most popular destinations.",
        isActive: updateData.isActive !== undefined ? updateData.isActive : true
      });
    } else {
      promo = await PromoModal.findByIdAndUpdate(promo._id, updateData, { new: true, runValidators: true });
    }
    
    res.status(200).json({ success: true, message: "Promo modal updated successfully", data: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to update promo modal" });
  }
};
