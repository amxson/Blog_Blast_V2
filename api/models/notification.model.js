import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actionUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: false, // Make this field optional
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      required: false, // Make this field optional
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
