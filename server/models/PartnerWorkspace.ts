import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { IPartnerWorkspace } from '../types';

export type IPartnerWorkspaceDocument = HydratedDocument<IPartnerWorkspace>;

const PartnerWorkspaceSchema = new Schema<IPartnerWorkspace>(
  {
    partner1Uid: {
      type: String,
      required: true,
      index: true,
    },
    partner1EbId: {
      type: String,
      required: true,
    },
    partner1Name: {
      type: String,
      default: '',
    },
    partner1Photo: {
      type: String,
      default: '',
    },
    partner2Uid: {
      type: String,
      required: true,
      index: true,
    },
    partner2EbId: {
      type: String,
      required: true,
    },
    partner2Name: {
      type: String,
      default: '',
    },
    partner2Photo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'connected',
      index: true,
    },
    inviteId: {
      type: String,
      default: null,
    },
    partner1Investment: {
      type: Number,
      default: 0,
    },
    partner2Investment: {
      type: Number,
      default: 0,
    },
    lastInvestmentUpdate: {
      type: Date,
      default: Date.now,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    disconnectedAt: {
      type: Date,
      default: null,
    },
    lastSync: {
      type: Date,
      default: Date.now,
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

PartnerWorkspaceSchema.index({ partner1Uid: 1, partner2Uid: 1, status: 1 });

export const PartnerWorkspace = mongoose.model<IPartnerWorkspace>(
  'PartnerWorkspace',
  PartnerWorkspaceSchema
);
