import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { IMessage } from '../types';

export type IMessageDocument = HydratedDocument<IMessage>;

const MessageSchema = new Schema<IMessage>(
  {
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    senderUid: {
      type: String,
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
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

MessageSchema.index({ workspaceId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
