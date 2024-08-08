import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import { create, deletepost, getposts, likePost, updatepost } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create)
router.get('/getposts', getposts)
router.put('/likePost/:postId', verifyToken, likePost);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost)
router.put('/updatepost/:postId/:userId', verifyToken, updatepost)


export default router;