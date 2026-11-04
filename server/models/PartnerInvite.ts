import mongoose, { Schema, HydratedDocument } from 'mongoose';
import { IPartnerInvite } from '../types';

export type IPartnerInviteDocument = HydratedDocument<IPartnerInvite>;

const PartnerInviteSchema = new Schema<IPartnerInvite>(
  {
    senderUid: {
      type: String,
      required: true,
      index: true,
    },
    senderEbId: {
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      default: '',
    },
    senderEmail: {
      type: String,
      default: '',
    },
    senderPhoto: {
      type: String,
      default: '',
    },
    receiverUid: {
      type: String,
      default: null,
      index: true,
    },
    receiverEbId: {
      type: String,
      default: null,
    },
    receiverEmail: {
      type: String,
      default: null,
    },
    receiverName: {
      type: String,
      default: null,
    },
    receiverPhoto: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'expired'],
      default: 'pending',
      index: true,
    },
    inviteCode: {
      type: String,
      required: true,
      index: true,
    },
    workspaceId: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
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

// Compound index for active invites lookup
PartnerInviteSchema.index({ senderUid: 1, receiverUid: 1, status: 1 });

export const PartnerInvite = mongoose.model<IPartnerInvite>('PartnerInvite', PartnerInviteSchema);
