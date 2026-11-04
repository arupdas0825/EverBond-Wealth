import { User, IUserDocument } from '../models/User';

/**
 * Generate a cryptographically random EverBond ID in the format EB-[A-Z0-9]{6}
 */
export function generateEverBondId(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Avoid visually ambiguous chars like 0/O, 1/I/L
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EB-${result}`;
}

/**
 * Get or atomically create a user in MongoDB.
 * GUARANTEE: EverBond ID is generated ONCE and permanently anchored to the firebaseUid.
 * It will NEVER regenerate on subsequent logins, refreshes, or devices.
 */
export async function getOrCreateUser(
  firebaseUid: string,
  email?: string,
  fullName?: string,
  photoURL?: string,
  preferredEbId?: string
): Promise<IUserDocument> {
  if (!firebaseUid) {
    throw new Error('firebaseUid is required.');
  }

  // 1. Check if user already exists
  const existingUser = await User.findOne({ firebaseUid });
  if (existingUser) {
    // Permanent EB ID already exists — update lastLogin and non-destructive profile attributes
    existingUser.lastLogin = new Date();
    if (fullName && (!existingUser.fullName || existingUser.fullName === 'User')) {
      existingUser.fullName = fullName;
    }
    if (photoURL && !existingUser.photoURL) {
      existingUser.photoURL = photoURL;
    }
    if (email && !existingUser.email) {
      existingUser.email = email;
      existingUser.normalizedEmail = email.trim().toLowerCase();
    }
    await existingUser.save();
    return existingUser;
  }

  // 2. User does not exist — atomic creation strategy with duplicate collision protection
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanName = fullName?.trim() || (email ? email.split('@')[0] : 'User');
  const cleanPhoto = photoURL || '';

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    attempts++;
    const candidateEbId = (preferredEbId && attempts === 1)
      ? (preferredEbId.trim().toUpperCase().startsWith('EB-') ? preferredEbId.trim().toUpperCase() : `EB-${preferredEbId.trim().toUpperCase()}`)
      : generateEverBondId();

    try {
      const newUser = await User.create({
        firebaseUid,
        ebId: candidateEbId,
        email: cleanEmail,
        normalizedEmail: cleanEmail,
        fullName: cleanName,
        photoURL: cleanPhoto,
        partnerStatus: 'none',
        partnerUid: null,
        partnerEbId: null,
        partnerName: null,
        partnerPhoto: null,
        workspaceId: null,
        connectedAt: null,
        lastLogin: new Date(),
      });

      console.log(
        `[EverBond Identity] New user created: firebaseUid=${firebaseUid}, permanent ebId=${candidateEbId}`
      );
      return newUser;
    } catch (err: any) {
      // If error is duplicate key on firebaseUid, another concurrent request created it — return that one
      if (err.code === 11000 && err.keyPattern?.firebaseUid) {
        const raceUser = await User.findOne({ firebaseUid });
        if (raceUser) return raceUser;
      }

      // If duplicate on ebId, loop and try another random EB ID
      if (err.code === 11000 && err.keyPattern?.ebId) {
        console.warn(`[EverBond Identity] EB ID collision for ${candidateEbId}. Retrying...`);
        continue;
      }

      throw err;
    }
  }

  throw new Error('Failed to generate a unique EverBond ID after multiple attempts.');
}

/**
 * Find user by EverBond ID or email address in MongoDB.
 * Normalizes EB IDs consistently:
 * - Trims all whitespace (e.g. 'EB - 33JSI7' -> 'EB-33JSI7')
 * - Uppercases and normalizes prefixes (e.g. 'eb-33jsi7' or '33jsi7' or 'EB33JSI7' -> 'EB-33JSI7')
 * - Case-insensitive lookup against ebId or normalizedEmail
 */
export async function findUserByIdentifier(identifier: string): Promise<IUserDocument | null> {
  if (!identifier || typeof identifier !== 'string') {
    console.warn('[UserService] findUserByIdentifier called with empty identifier');
    return null;
  }

  const raw = identifier.trim();
  if (!raw) return null;

  // 1. Email lookup
  if (raw.includes('@')) {
    const cleanEmail = raw.toLowerCase().trim();
    const userByEmail = await User.findOne({ normalizedEmail: cleanEmail });
    if (!userByEmail) {
      console.log(`[UserService] Lookup by email "${cleanEmail}": Not found in MongoDB`);
    } else {
      console.log(`[UserService] Lookup by email "${cleanEmail}": Found user ${userByEmail.fullName} (${userByEmail.ebId})`);
    }
    return userByEmail;
  }

  // 2. EverBond ID lookup with robust normalization
  const stripped = raw.replace(/[\s\-_]/g, '').toUpperCase();
  const candidateCodes: string[] = [];
  if (stripped.startsWith('EB')) {
    candidateCodes.push(stripped.slice(2));
  } else {
    candidateCodes.push(stripped);
  }

  const uniqueCandidates = Array.from(
    new Set([
      raw.toUpperCase().replace(/\s+/g, ''),
      ...candidateCodes.map((code) => `EB-${code}`),
      ...candidateCodes.map((code) => code),
    ])
  );

  const user = await User.findOne({
    $or: [
      { ebId: { $in: uniqueCandidates } },
      { ebId: { $regex: new RegExp(`^${uniqueCandidates[0]}$`, 'i') } },
      { normalizedEmail: raw.toLowerCase() },
    ],
  });

  if (!user) {
    console.log(`[UserService] Lookup by EB ID "${raw}" (candidates: ${uniqueCandidates.join(', ')}): Not found in MongoDB`);
  } else {
    console.log(`[UserService] Lookup by EB ID "${raw}": Found user ${user.fullName} (${user.ebId})`);
  }

  return user;
}

/**
 * Complete onboarding for an authenticated user.
 * Saves profile, demographic settings, mode, and agreements to MongoDB.
 * Never regenerates or alters the permanent ebId.
 */
export async function completeUserOnboarding(
  firebaseUid: string,
  data: {
    fullName?: string;
    age?: number;
    country?: string;
    currency?: string;
    mode?: string;
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    dataConsent?: boolean;
  }
): Promise<IUserDocument> {
  let user = await User.findOne({ firebaseUid });
  if (!user) {
    user = await getOrCreateUser(firebaseUid, undefined, data.fullName);
  }

  if (data.fullName && data.fullName.trim()) {
    user.fullName = data.fullName.trim();
  }
  if (data.age && !isNaN(Number(data.age))) {
    user.age = Number(data.age);
  }
  if (data.country) {
    user.country = data.country;
  }
  if (data.currency) {
    user.currency = data.currency;
  }
  if (data.mode) {
    user.mode = data.mode;
  }
  user.onboardingCompleted = true;
  user.termsAccepted = data.termsAccepted ?? true;
  user.privacyAccepted = data.privacyAccepted ?? true;
  user.dataConsent = data.dataConsent ?? true;
  user.lastLogin = new Date();

  await user.save();
  return user;
}

