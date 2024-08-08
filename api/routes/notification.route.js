import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js'; // Import your authentication middleware
import { getUnreadNotifications } from '../controllers/notification.controller.js'; // Import the controller function
import { markNotificationsAsRead } from '../controllers/notification.controller.js';
import { getNotificationCounts } from '../controllers/notification.controller.js';
import { getNotifications } from '../controllers/notification.controller.js';


const router = express.Router();

router.get('/unread', verifyToken, getUnreadNotifications);
router.post('/mark-as-read', verifyToken, markNotificationsAsRead);
router.get('/all', verifyToken, getNotifications);
router.get('/counts', verifyToken, getNotificationCounts);

export default router;
