// models/JobApplication.ts
import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  hrEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  position: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['applied', 'follow-up', 'interview', 'rejected', 'offer'],
    default: 'applied',
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  resumeSent: {
    type: Boolean,
    default: false,
  },
  dateSent: {
    type: Date,
  },
  followUpDate: {
    type: Date,
  },
  remarks: {
    type: String,
  },
  resumeUrl: {
    type: String,
  },
  emailTemplateUsed: {
    type: String,
  },
  lastEmailSent: {
    type: Date,
  },
}, {
  timestamps: true,
});

jobApplicationSchema.index({ userId: 1, createdAt: -1 });
jobApplicationSchema.index({ userId: 1, status: 1 });

export const JobApplication = mongoose.models.JobApplication || mongoose.model('JobApplication', jobApplicationSchema);