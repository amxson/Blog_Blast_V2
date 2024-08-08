import Post from '../models/post.model.js';
import { errorHandler } from '../middleware/error.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';

export const create = async (req, res, next) => {
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }

  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');

  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
    tags: req.body.tags || [],
  });

  try {
    const savedPost = await newPost.save();

    // Fetch user and followers after saving the post
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, 'User not found'));

    const followers = user.followers;

    // Create notifications for each follower
    const notifications = followers.map((followerId) => ({
      userId: followerId,
      actionUserId: req.user.id,
      postId: savedPost._id,
      type: 'post',
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};


export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;

    const query = {
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
      ...(req.query.tag && { tags: { $in: [req.query.tag] } }),
    };

    const posts = await Post.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments(query);

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    console.error('Error in getposts controller:', error); // Log the error
    next(error);
  }
};

