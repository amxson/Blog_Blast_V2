// In your controller, e.g., notification.controller.js
import Notification from '../models/notification.model.js';

export const getUnreadNotifications = async (req, res, next) => {
  try {
    const unreadNotifications = await Notification.find({
      userId: req.user.id,
      read: false,
    }).sort({ createdAt: -1 });
    res.status(200).json(unreadNotifications);
  } catch (error) {
    next(error);
  }
};

// In notification.controller.js
export const getNotificationCounts = async (req, res, next) => {
    try {
      const unreadCount = await Notification.countDocuments({
        userId: req.user.id,
        read: false,
      });
  
      res.status(200).json({ unreadCount });
    } catch (error) {
      next(error);
    }
  };
  

  export const getNotifications = async (req, res, next) => {
    try {
      const notifications = await Notification.find({ userId: req.user.id })
        .populate('actionUserId', 'username') // Populate actionUserId
        .populate('postId') // Optionally, populate the post details if needed
        .populate('commentId') // Optionally, populate the comment details if needed
        .sort({ createdAt: -1 });
  
     
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  };
  


export const markNotificationsAsRead = async (req, res, next) => {
  try {
    // Mark all notifications as read
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    

    // Delete all notifications for the user
    await Notification.deleteMany({ userId: req.user.id });

    res.status(200).json({ message: 'Notifications marked as read and deleted' });
  } catch (error) {
    next(error);
  }
};

