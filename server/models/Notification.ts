import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { INotification } from '../types';

export type INotificationDocument = HydratedDocument<INotification>;

const NotificationSchema = new Schema<INotification>(
  {
    recipientUid: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedInviteId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

NotificationSchema.index({ recipientUid: 1, createdAt: -1 });
NotificationSchema.index({ recipientUid: 1, read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
