// user.routes.js
import express from 'express';
import {
  deleteUser,
  getUser,
  getUsers,
  signout,
  test,
  updateUser,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing
} from '../controllers/user.controller.js';
import { verifyToken } from '../middleware/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', getUser);
router.get('/:userId/followers', verifyToken, getUserFollowers);
router.get('/:userId/following', verifyToken, getUserFollowing);
router.put('/follow/:userId', verifyToken, followUser);    
router.put('/unfollow/:userId', verifyToken, unfollowUser);

export default router;
