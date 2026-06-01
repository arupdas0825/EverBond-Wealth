import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateEverBondId } from '../utils/everbondId';

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
      everBondId:          '',              // User's permanent EB-XXXXXX (generated once, persisted)
      partnerEverBondId:   '',              // Partner's EverBond ID
      connectionStatus:    'none',          // 'none' | 'pending' | 'connected'
      requestSentAt:       null,            // ISO timestamp when request was sent
      relationshipDate:    '',              // Anniversary / relationship date
      relationshipId:      '',              // Unique relationship identifier

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

      setStage: stage => set({ stage, relationshipStage: stage }),
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
        if (!current) {
          set({ everBondId: generateEverBondId() });
        }
      },

      /** Send a connection request to a partner */
      sendConnectionRequest: ({ partnerEverBondId, relationshipDate }) => {
        set({
          partnerEverBondId,
          relationshipDate: relationshipDate || '',
          connectionStatus: 'pending',
          requestSentAt: new Date().toISOString(),
          // Also sync legacy fields for backward compat
          verificationStatus: 'awaiting',
        });
      },

      /** Accept/complete the connection (mock — simulates partner accepting) */
      acceptConnection: ({ partnerName }) => {
        const relId = `REL-${Math.floor(100000 + Math.random() * 900000)}`;
        set({
          connectionStatus: 'connected',
          partner2: partnerName || 'Partner',
          partnerName: partnerName || 'Partner',
          relationshipId: relId,
          // Sync legacy fields
          partnerLinked: true,
          partnerAccepted: true,
          verificationStatus: 'verified',
          partnerId: get().partnerEverBondId,
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
          partner2: '',
          partnerName: '',
          // Sync legacy fields
          partnerLinked: false,
          partnerAccepted: false,
          verificationStatus: 'unverified',
          invitationCode: '',
          partnerId: '',
        });
      },

      setProfile: ({ 
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
      }) => {
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
        }
        if (p1Salary !== undefined) update.p1Salary = p1Salary;
        if (p2Salary !== undefined) update.p2Salary = p2Salary;
        
        // New EverBond ID fields
        if (everBondId !== undefined) update.everBondId = everBondId;
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
          partnerEverBondId: '',
          connectionStatus: 'none',
          requestSentAt: null,
          relationshipDate: '',
          relationshipId: '',

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