import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { IUser } from '../types';

export type IUserDocument = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ebId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    normalizedEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      default: '',
    },
    fullName: {
      type: String,
      trim: true,
      default: 'User',
    },
    photoURL: {
      type: String,
      default: '',
    },
    age: {
      type: Number,
      default: null,
    },
    country: {
      type: String,
      default: 'India',
    },
    currency: {
      type: String,
      default: 'INR',
    },
    mode: {
      type: String,
      default: 'Single',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    privacyAccepted: {
      type: Boolean,
      default: false,
    },
    dataConsent: {
      type: Boolean,
      default: false,
    },
    partnerUid: {
      type: String,
      default: null,
      index: true,
    },
    partnerEbId: {
      type: String,
      default: null,
    },
    partnerName: {
      type: String,
      default: null,
    },
    partnerPhoto: {
      type: String,
      default: null,
    },
    partnerStatus: {
      type: String,
      enum: ['none', 'pending', 'connected', 'disconnected'],
      default: 'none',
      index: true,
    },
    workspaceId: {
      type: String,
      default: null,
      index: true,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save to always normalize email
UserSchema.pre('save', function (this: any) {
  if (this.email) {
    this.normalizedEmail = String(this.email).trim().toLowerCase();
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
