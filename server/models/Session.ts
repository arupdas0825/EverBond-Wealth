import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { ISession } from '../types';

export type ISessionDocument = HydratedDocument<ISession>;

const SessionSchema = new Schema<ISession>(
  {
    userUid: {
      type: String,
      required: true,
      index: true,
    },
    workspaceId: {
      type: String,
      default: null,
      index: true,
    },
    socketId: {
      type: String,
      required: true,
      unique: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
