import { runTripPlannerChat } from "../services/ai/chatOrchestrator.js";
import { getClientSiteUrl } from "../utils/publicUrl.js";

export const postChat = async (req, res, next) => {
  try {
    const { message, messages } = req.body;
    const clientSite = getClientSiteUrl(req);

    const data = await runTripPlannerChat({
      message,
      messages: Array.isArray(messages) ? messages : [],
      siteBaseUrl: clientSite,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
