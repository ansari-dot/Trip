import Notification from "../models/Notification.js";

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private/Admin
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private/Admin
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};
