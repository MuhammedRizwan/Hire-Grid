// models/Notification.ts
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['followup', 'email', 'reminder'],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication',
  },
}, {
  timestamps: true,
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);