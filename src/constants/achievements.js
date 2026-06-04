// Definition of all journey rewards and badges for EverBond Wealth
export const ACHIEVEMENT_CATEGORIES = {
  ONBOARDING: 'Onboarding',
  FINANCIAL: 'Financial',
  GOALS: 'Goals',
  RELATIONSHIP: 'Relationship',
  MILESTONE: 'Milestone',
  ELITE: 'Elite'
};

export const ACHIEVEMENTS = [
  // Onboarding
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete onboarding and initialize your wealth node.',
    category: ACHIEVEMENT_CATEGORIES.ONBOARDING,
    icon: '🌱',
    xp: 10
  },
  {
    id: 'profile-builder',
    title: 'Profile Builder',
    description: 'Complete setting up your user profile.',
    category: ACHIEVEMENT_CATEGORIES.ONBOARDING,
    icon: '⚙️',
    xp: 15
  },
  
  // Financial
  {
    id: 'income-creator',
    title: 'Income Creator',
    description: 'Add your first income stream to the ledger.',
    category: ACHIEVEMENT_CATEGORIES.FINANCIAL,
    icon: '💰',
    xp: 25
  },
  {
    id: 'wealth-builder',
    title: 'Wealth Builder',
    description: 'Accumulate a significant net worth target.',
    category: ACHIEVEMENT_CATEGORIES.FINANCIAL,
    icon: '📈',
    xp: 50
  },
  
  // Goals
  {
    id: 'journey-started',
    title: 'Journey Started',
    description: 'Create your first financial goal target.',
    category: ACHIEVEMENT_CATEGORIES.GOALS,
    icon: '🎯',
    xp: 20
  },
  {
    id: 'milestone-maker',
    title: 'Milestone Maker',
    description: 'Create a specific linear milestone.',
    category: ACHIEVEMENT_CATEGORIES.GOALS,
    icon: '🚩',
    xp: 20
  },

  // Relationship
  {
    id: 'connection-sent',
    title: 'The Invitation',
    description: 'Send a connection request to your partner.',
    category: ACHIEVEMENT_CATEGORIES.RELATIONSHIP,
    icon: '💌',
    xp: 15
  },
  {
    id: 'bonded',
    title: 'Bonded Nodes',
    description: 'Successfully link dashboards with your partner.',
    category: ACHIEVEMENT_CATEGORIES.RELATIONSHIP,
    icon: '🔗',
    xp: 50
  },
  {
    id: 'dynasty',
    title: 'Family Dynasty',
    description: 'Upgrade your stage to Married and unlock family planning.',
    category: ACHIEVEMENT_CATEGORIES.RELATIONSHIP,
    icon: '👑',
    xp: 100
  },

  // Elite (Aspirational)
  {
    id: 'visionary',
    title: 'Visionary',
    description: 'Set ambitious targets for over 3 different goals.',
    category: ACHIEVEMENT_CATEGORIES.ELITE,
    icon: '👁️',
    xp: 150
  }
];

export const getAchievementData = (id) => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

// Calculate level based on XP (e.g. 100 XP per level, exponential scaling or simple flat curve)
// For simplicity, let's use a standard scaling formula. 
// Level 1 = 0 XP, Level 2 = 50 XP, Level 3 = 120 XP, Level 4 = 220 XP, etc.
export const calculateJourneyLevel = (totalXP) => {
  if (totalXP < 50) return 1;
  if (totalXP < 120) return 2;
  if (totalXP < 220) return 3;
  if (totalXP < 350) return 4;
  if (totalXP < 500) return 5;
  if (totalXP < 700) return 6;
  if (totalXP < 1000) return 7;
  return Math.floor((totalXP - 1000) / 400) + 8; // Past level 7, every 400 XP is a level
};

export const getXPForNextLevel = (totalXP) => {
  if (totalXP < 50) return 50;
  if (totalXP < 120) return 120;
  if (totalXP < 220) return 220;
  if (totalXP < 350) return 350;
  if (totalXP < 500) return 500;
  if (totalXP < 700) return 700;
  if (totalXP < 1000) return 1000;
  const levelsPast7 = Math.floor((totalXP - 1000) / 400);
  return 1000 + ((levelsPast7 + 1) * 400);
};
