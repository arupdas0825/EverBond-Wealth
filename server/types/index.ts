export type PartnerStatus = 'none' | 'pending' | 'connected' | 'disconnected';
export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'expired';
export type WorkspaceStatus = 'connected' | 'disconnected';

export interface IUser {
  firebaseUid: string;
  ebId: string;
  email?: string;
  normalizedEmail?: string;
  fullName: string;
  photoURL?: string;
  age?: number | null;
  country?: string;
  currency?: string;
  mode?: string;
  onboardingCompleted?: boolean;
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  dataConsent?: boolean;
  partnerUid?: string | null;
  partnerEbId?: string | null;
  partnerName?: string | null;
  partnerPhoto?: string | null;
  partnerStatus: PartnerStatus;
  workspaceId?: string | null;
  connectedAt?: Date | null;
  createdAt: Date;
  lastLogin: Date;
}

export interface IPartnerInvite {
  id?: string;
  senderUid: string;
  senderEbId: string;
  senderName: string;
  senderEmail?: string;
  senderPhoto?: string;
  receiverUid?: string | null;
  receiverEbId?: string | null;
  receiverEmail?: string | null;
  receiverName?: string | null;
  receiverPhoto?: string | null;
  status: InviteStatus;
  inviteCode: string;
  workspaceId?: string | null;
  expiresAt: Date;
  acceptedAt?: Date | null;
  rejectedAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
}

export interface IPartnerWorkspace {
  id?: string;
  partner1Uid: string;
  partner1EbId: string;
  partner1Name: string;
  partner1Photo?: string;
  partner2Uid: string;
  partner2EbId: string;
  partner2Name: string;
  partner2Photo?: string;
  status: WorkspaceStatus;
  inviteId?: string;
  partner1Investment?: number;
  partner2Investment?: number;
  lastInvestmentUpdate?: Date;
  connectedAt: Date;
  disconnectedAt?: Date | null;
  lastSync: Date;
}

export interface INotification {
  id?: string;
  recipientUid: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  relatedInviteId?: string | null;
  createdAt: Date;
}

export interface ISession {
  userUid: string;
  workspaceId?: string | null;
  socketId: string;
  connectedAt: Date;
  lastActive: Date;
}

export interface IMessage {
  id?: string;
  workspaceId: string;
  senderUid: string;
  senderName: string;
  text: string;
  createdAt: Date;
}

export type SocketAuthUser = {
  uid: string;
  email?: string;
};
