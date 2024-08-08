import bcryptjs from 'bcryptjs';
import { errorHandler } from '../middleware/error.js';
import User from '../models/user.model.js';
import Notification from '../models/notification.model.js';

export const test = (req, res) => {
  res.json({ message: 'API is working!' });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters'));
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 7 || req.body.username.length > 20) {
      return next(
        errorHandler(400, 'Username must be between 7 and 20 characters')
      );
    }
    if (req.body.username.includes(' ')) {
      return next(errorHandler(400, 'Username cannot contain spaces'));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, 'Username must be lowercase'));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, 'Username can only contain letters and numbers')
      );
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          profilePicture: req.body.profilePicture,
          password: req.body.password,
        },
      },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this user'));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json('User has been deleted');
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie('access_token')
      .status(200)
      .json('User has been signed out');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params; // The user to be followed
    const currentUserId = req.user.id; // The currently logged-in user

    if (userId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    // Find the user to follow
    const userToFollow = await User.findById(userId);
    if (!userToFollow) return next(errorHandler(404, 'User to follow not found'));

    // Check if the current user is already following the user
    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Update the followers and following arrays
    await User.findByIdAndUpdate(userId, {
      $push: { followers: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $push: { following: userId },
    });

    // Create a follow notification
    const notification = new Notification({
      userId: userId,
      actionUserId: currentUserId,
      type: 'follow',
    });

    await notification.save(); // Save the notification

    res.status(200).json({ message: 'Followed successfully' });
  } catch (error) {
    next(error);
  }
};


export const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if the user is already following
    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) return next(errorHandler(404, 'User to unfollow not found'));

    if (!userToUnfollow.followers.includes(currentUserId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { followers: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: userId },
    });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .populate('followers', 'username _id') // Populate followers field
      .exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.followers); // Return only the followers
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserFollowing = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .populate('following', 'username _id') // Populate following field
      .exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.following); // Return only the following
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};