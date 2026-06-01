import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generatePersonalId, generateCoupleId, generateFamilyId, generateEverBondId } from '../utils/everbondId';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      // Onboarding & Stage System
      started:   false,
      onboardingComplete: false,
      stage:     'Single', // 'Single' | 'Committed' | 'Married'
      relationshipStage: 'Single',
      partner1:  '',
      userName:  '',
      partner2:  '',
      partnerName: '',
      region:    'India',
      country:   'India',
      currency:  'INR',
      dreamGoals: [],
      mindset:   'Balanced',
      theme:     'light',

      // ── EverBond ID Partner Linking System ──
      everBondId:          '',              // User's permanent EB-[NAME_4]-[HEX_4] (generated on profile save)
      coupleId:            '',              // Permanent Couple ID (EB-COUPLE-XXXX-XXXX)
      familyId:            '',              // Permanent Family ID (EB-FAMILY-XXXX-XXXXX)
      partnerEverBondId:   '',              // Partner's EverBond ID
      connectionStatus:    'none',          // 'none' | 'pending' | 'received' | 'connected'
      requestSentAt:       null,            // ISO timestamp when request was sent
      relationshipDate:    '',              // Anniversary / relationship date
      relationshipId:      '',              // Unique relationship identifier
      
      // Future backend preparation fields
      requestSent:         false,           // User sent a connection request
      requestReceived:     false,           // User received a connection request
      connectedAt:         null,            // ISO timestamp when accepted
      incomingRequest:     null,            // Incoming request metadata { senderEverBondId, senderName, relationshipDate, sentAt }

      // Legacy verification states (kept for backward compat during transition)
      invitationAccepted: false,
      selfieUploaded:     false,
      selfieUrl:          '',
      accountsConnected:  false,
      relationshipVerified: false,

      // Mapped from legacy → new system
      partnerLinked:      false,
      partnerAccepted:    false,
      verificationStatus: 'unverified', // 'unverified' | 'awaiting' | 'connected' | 'verified'
      invitationCode:     '',
      partnerId:          '',

      // Onboarding data splits
      onboardingSingle: {
        name: '',
        age: '',
        country: 'India',
        income: '',
        careerStage: '',
        financialGoals: '',
      },
      onboardingCommitted: {
        name: '',
        partnerName: '',
        anniversaryDate: '',
        combinedGoals: '',
      },
      onboardingMarried: {
        name: '',
        partnerName: '',
        familyGoals: '',
        childPlans: '',
        currentSavings: '',
        futurePlanningGoals: '',
      },

      // Income
      p1Salary: 100000,
      p2Salary: 0,

      // Settings
      mode:      'Balanced',
      simYears:  10,
      simReturn: null,

      // Goals
      goalTargets: {
        child:      5000000,
        retirement: 20000000,
        house:      8000000,
        vacation:   500000,
      },

      // Milestones
      milestones: [],

      // ── Actions ──

      setStage: stage => {
        const currentFamilyId = get().familyId;
        const patch = { stage, relationshipStage: stage };
        if (stage === 'Married' && !currentFamilyId) {
          patch.familyId = generateFamilyId(get().partner1, get().partner2);
        }
        set(patch);
      },
      setMindset: mindset => set({ mindset, mode: mindset }),
      setDreamGoals: dreamGoals => set({ dreamGoals }),
      setTheme: theme => set({ theme }),
      
      setOnboardingSingle: data => set(s => ({ onboardingSingle: { ...s.onboardingSingle, ...data } })),
      setOnboardingCommitted: data => set(s => ({ onboardingCommitted: { ...s.onboardingCommitted, ...data } })),
      setOnboardingMarried: data => set(s => ({ onboardingMarried: { ...s.onboardingMarried, ...data } })),

      setVerificationState: patch => set(patch),

      // ── EverBond ID Actions ──

      /** Generate and persist an EverBond ID if one doesn't exist */
      initEverBondId: () => {
        const current = get().everBondId;
        // If empty or in old 6-character format, generate a new personalized / default Personal ID
        if (!current || current.length <= 9) {
          set({ everBondId: generatePersonalId(get().partner1 || 'USER') });
        }
      },

      /** Send a connection request to a partner */
      sendConnectionRequest: ({ partnerEverBondId, relationshipDate }) => {
        set({
          partnerEverBondId,
          relationshipDate: relationshipDate || '',
          connectionStatus: 'pending',
          requestSentAt: new Date().toISOString(),
          requestSent: true,
          requestReceived: false,
          // Also sync legacy fields for backward compat
          verificationStatus: 'awaiting',
        });
      },

      /** Simulate an incoming request from another user (for testing received state) */
      simulateIncomingRequest: ({ senderEverBondId, senderName, relationshipDate }) => {
        const dateVal = relationshipDate || '2025-02-15';
        set({
          connectionStatus: 'received',
          requestSent: false,
          requestReceived: true,
          incomingRequest: {
            senderEverBondId,
            senderName,
            relationshipDate: dateVal,
            sentAt: new Date().toISOString(),
          },
          // Populate fields so acceptance resolves smoothly
          partnerEverBondId: senderEverBondId,
          partner2: senderName,
          partnerName: senderName,
          relationshipDate: dateVal,
          verificationStatus: 'awaiting',
        });
      },

      /** Decline an incoming request */
      declineRequest: () => {
        set({
          connectionStatus: 'none',
          requestSent: false,
          requestReceived: false,
          incomingRequest: null,
          partnerEverBondId: '',
          partner2: '',
          partnerName: '',
          relationshipDate: '',
          requestSentAt: null,
          connectedAt: null,
          verificationStatus: 'unverified',
        });
      },

      /** Accept/complete the connection (either pending or received) */
      acceptConnection: ({ partnerName }) => {
        const relId = `REL-${Math.floor(100000 + Math.random() * 900000)}`;
        const incoming = get().incomingRequest;
        
        const resolvedName = partnerName || (incoming ? incoming.senderName : '') || get().partnerName || 'Partner';
        const resolvedId = get().partnerEverBondId || (incoming ? incoming.senderEverBondId : '') || 'EB-UNKNOWN';
        const resolvedDate = get().relationshipDate || (incoming ? incoming.relationshipDate : '');
        
        // Generate Couple ID once connection is established
        let resolvedCoupleId = get().coupleId;
        if (!resolvedCoupleId) {
          resolvedCoupleId = generateCoupleId();
        }

        set({
          connectionStatus: 'connected',
          partner2: resolvedName,
          partnerName: resolvedName,
          partnerEverBondId: resolvedId,
          relationshipDate: resolvedDate,
          relationshipId: relId,
          coupleId: resolvedCoupleId,
          connectedAt: new Date().toISOString(),
          requestSent: false,
          requestReceived: false,
          incomingRequest: null,
          
          // Sync legacy fields
          partnerLinked: true,
          partnerAccepted: true,
          verificationStatus: 'verified',
          partnerId: resolvedId,
        });
      },

      /** Disconnect partner — reset all connection state */
      disconnectPartner: () => {
        set({
          connectionStatus: 'none',
          partnerEverBondId: '',
          relationshipDate: '',
          requestSentAt: null,
          relationshipId: '',
          coupleId: '',
          familyId: '',
          partner2: '',
          partnerName: '',
          requestSent: false,
          requestReceived: false,
          connectedAt: null,
          incomingRequest: null,
          // Sync legacy fields
          partnerLinked: false,
          partnerAccepted: false,
          verificationStatus: 'unverified',
          invitationCode: '',
          partnerId: '',
        });
      },

      setProfile: (profileData) => {
        const { 
          partner1, 
          partner2, 
          region, 
          currency, 
          stage, 
          p1Salary, 
          p2Salary,
          partnerLinked,
          partnerAccepted,
          verificationStatus,
          invitationCode,
          partnerId,
          relationshipId,
          everBondId,
          partnerEverBondId,
          connectionStatus,
          relationshipDate,
        } = profileData;

        const update = { 
          started: true, 
          onboardingComplete: true, 
          partner1, 
          userName: partner1,
          partner2, 
          partnerName: partner2,
          region, 
          country: region,
          currency 
        };
        if (stage) {
          update.stage = stage;
          update.relationshipStage = stage;
          // Generate Family ID if stage is Married
          if (stage === 'Married' && !get().familyId) {
            update.familyId = generateFamilyId(partner1 || get().partner1, partner2 || get().partner2);
          }
        }
        if (p1Salary !== undefined) update.p1Salary = p1Salary;
        if (p2Salary !== undefined) update.p2Salary = p2Salary;
        
        // Check and personalize Personal ID based on user name
        const existingId = everBondId || get().everBondId;
        if (!existingId || existingId.length <= 9 || (partner1 && !existingId.includes(partner1.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4)))) {
          // If empty, old format, or doesn't match the new partner1 name, generate a new personalized one!
          update.everBondId = generatePersonalId(partner1);
        } else {
          update.everBondId = existingId;
        }

        if (partnerEverBondId !== undefined) update.partnerEverBondId = partnerEverBondId;
        if (connectionStatus !== undefined) update.connectionStatus = connectionStatus;
        if (relationshipDate !== undefined) update.relationshipDate = relationshipDate;
        
        // Legacy partnership linking states
        if (partnerLinked !== undefined) update.partnerLinked = partnerLinked;
        if (partnerAccepted !== undefined) update.partnerAccepted = partnerAccepted;
        if (verificationStatus !== undefined) update.verificationStatus = verificationStatus;
        if (invitationCode !== undefined) update.invitationCode = invitationCode;
        if (partnerId !== undefined) update.partnerId = partnerId;
        if (relationshipId !== undefined) update.relationshipId = relationshipId;
        
        set(update);
      },

      setP1Salary: v => set({ p1Salary: v }),
      setP2Salary: v => set({ p2Salary: v }),
      setMode:     v => set({ mode: v }),
      setCurrency: v => set({ currency: v }),
      setSimYears: v => set({ simYears: v }),
      setSimReturn:v => set({ simReturn: v }),
      setGoalTargets: t => set({ goalTargets: t }),

      // Milestone Actions
      addMilestone: (m) => set(s => ({
        milestones: [...s.milestones, { ...m, id: Date.now(), createdAt: new Date().toISOString() }]
      })),

      updateMilestone: (id, patch) => set(s => ({
        milestones: s.milestones.map(m => m.id === id ? { ...m, ...patch } : m)
      })),

      removeMilestone: (id) => set(s => ({
        milestones: s.milestones.filter(m => m.id !== id)
      })),

      getTotalSalary: () => {
        const { p1Salary, p2Salary, stage } = get();
        // Single stage only has P1 Salary
        if (stage === 'Single') return p1Salary || 0;
        return (p1Salary || 0) + (p2Salary || 0);
      },

      reset: () => {
        const newId = generateEverBondId();
        set({
          started: false,
          onboardingComplete: false,
          stage: 'Single',
          relationshipStage: 'Single',
          theme: 'light',
          partner1: '',
          userName: '',
          partner2: '',
          partnerName: '',
          region: 'India',
          country: 'India',
          currency: 'INR',
          dreamGoals: [],
          mindset: 'Balanced',
          invitationAccepted: false,
          selfieUploaded: false,
          selfieUrl: '',
          accountsConnected: false,
          relationshipVerified: false,
          
          // Reset EverBond ID system (regenerate fresh ID)
          everBondId: newId,
          coupleId: '',
          familyId: '',
          partnerEverBondId: '',
          connectionStatus: 'none',
          requestSentAt: null,
          relationshipDate: '',
          relationshipId: '',
          requestSent: false,
          requestReceived: false,
          connectedAt: null,
          incomingRequest: null,

          // Reset legacy partner linking state
          partnerLinked: false,
          partnerAccepted: false,
          verificationStatus: 'unverified',
          invitationCode: '',
          partnerId: '',

          onboardingSingle: {
            name: '',
            age: '',
            country: 'India',
            income: '',
            careerStage: '',
            financialGoals: '',
          },
          onboardingCommitted: {
            name: '',
            partnerName: '',
            anniversaryDate: '',
            combinedGoals: '',
          },
          onboardingMarried: {
            partnerName: '',
            familyGoals: '',
            childPlans: '',
            currentSavings: '',
            futurePlanningGoals: '',
          },
          p1Salary: 100000,
          p2Salary: 0,
          mode: 'Balanced',
          simYears: 10,
          simReturn: null,
          milestones: [],
          goalTargets: {
            child: 5000000,
            retirement: 20000000,
            house: 8000000,
            vacation: 500000,
          },
        });
      },
    }),
    { name: 'eb_v6' }
  )
);