import Post from "../models/post.model.js";
import { errorHandler } from "../middleware/error.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import sanitizeHtml from "sanitize-html";

export const cleanPostContent = (content) =>
  sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
const escapeSearch = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const create = async (req, res, next) => {
  if (
    typeof req.body.title !== "string" ||
    typeof req.body.content !== "string" ||
    !req.body.title.trim() ||
    !req.body.content.trim() ||
    req.body.title.length > 200 ||
    req.body.content.length > 100000
  ) {
    return next(errorHandler(400, "Please provide all required fields"));
  }

  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  const newPost = new Post({
    title: req.body.title.trim(),
    content: cleanPostContent(req.body.content),
    category: req.body.category,
    image: req.body.image,
    slug,
    userId: req.user.id,
    tags: Array.isArray(req.body.tags)
      ? req.body.tags.slice(0, 20).filter((tag) => typeof tag === "string")
      : [],
  });

  try {
    const savedPost = await newPost.save();

    // Fetch user and followers after saving the post
    const user = await User.findById(req.user.id);
    if (!user) return next(errorHandler(404, "User not found"));

    const followers = user.followers;

    // Create notifications for each follower
    const notifications = followers.map((followerId) => ({
      userId: followerId,
      actionUserId: req.user.id,
      postId: savedPost._id,
      type: "post",
    }));

    await Notification.insertMany(notifications);

    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = Math.max(
      0,
      Math.min(10000, parseInt(req.query.startIndex) || 0),
    );
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 9));
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const query = {
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          {
            title: {
              $regex: escapeSearch(String(req.query.searchTerm).slice(0, 200)),
              $options: "i",
            },
          },
          {
            content: {
              $regex: escapeSearch(String(req.query.searchTerm).slice(0, 200)),
              $options: "i",
            },
          },
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
      now.getDate(),
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
    console.error("Error in getposts controller:", error); // Log the error
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(errorHandler(404, "Post not found"));
    if (String(post.userId) !== req.user.id && !req.user.isAdmin)
      return next(errorHandler(403, "You cannot delete this post"));
    await Post.findByIdAndDelete(post._id);
    return res.status(200).json("The post has been deleted");
  } catch (error) {
    return next(error);
  }
};

export const updatepost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(errorHandler(404, "Post not found"));
    if (String(post.userId) !== req.user.id && !req.user.isAdmin)
      return next(errorHandler(403, "You cannot update this post"));
    const update = {};
    for (const field of ["title", "category", "image"]) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string")
          return next(errorHandler(400, "Invalid post fields"));
        update[field] = req.body[field];
      }
    }
    if (req.body.content !== undefined) {
      if (
        typeof req.body.content !== "string" ||
        req.body.content.length > 100000
      )
        return next(errorHandler(400, "Invalid post content"));
      update.content = cleanPostContent(req.body.content);
    }
    if (req.body.tags !== undefined) {
      if (
        !Array.isArray(req.body.tags) ||
        req.body.tags.length > 20 ||
        req.body.tags.some((tag) => typeof tag !== "string")
      )
        return next(errorHandler(400, "Invalid tags"));
      update.tags = req.body.tags;
    }
    const updatedPost = await Post.findByIdAndUpdate(
      post._id,
      { $set: update },
      { new: true, runValidators: true },
    );
    return res.status(200).json(updatedPost);
  } catch (error) {
    return next(error);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const userId = req.user.id;
    const userIndex = post.likes.indexOf(userId);

    if (userIndex === -1) {
      post.numberOfLikes += 1;
      post.likes.push(userId);

      // Create a notification for the post owner
      if (post.userId.toString() !== userId) {
        const notification = new Notification({
          userId: post.userId,
          postId: post._id,
          actionUserId: userId,
          type: "like",
        });
        await notification.save();
      }
    } else {
      post.numberOfLikes -= 1;
      post.likes.splice(userIndex, 1);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
