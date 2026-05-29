import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      // Onboarding & Stage System
      started:   false,
      stage:     'Single', // 'Single' | 'Committed' | 'Married'
      partner1:  '',
      partner2:  '',
      region:    'India',
      currency:  'INR',
      dreamGoals: [],
      mindset:   'Balanced',
      theme:     'light',

      // Verification states for Committed stage
      invitationAccepted: false,
      selfieUploaded:     false,
      selfieUrl:          '',
      accountsConnected:  false,
      relationshipVerified: false,

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
        spouseName: '',
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

      // Actions
      setStage: stage => set({ stage }),
      setMindset: mindset => set({ mindset, mode: mindset }),
      setDreamGoals: dreamGoals => set({ dreamGoals }),
      setTheme: theme => set({ theme }),
      
      setOnboardingSingle: data => set(s => ({ onboardingSingle: { ...s.onboardingSingle, ...data } })),
      setOnboardingCommitted: data => set(s => ({ onboardingCommitted: { ...s.onboardingCommitted, ...data } })),
      setOnboardingMarried: data => set(s => ({ onboardingMarried: { ...s.onboardingMarried, ...data } })),

      setVerificationState: patch => set(patch),

      setProfile: ({ partner1, partner2, region, currency, stage, p1Salary, p2Salary }) => {
        const update = { started: true, partner1, partner2, region, currency };
        if (stage) update.stage = stage;
        if (p1Salary !== undefined) update.p1Salary = p1Salary;
        if (p2Salary !== undefined) update.p2Salary = p2Salary;
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
        set({
          started: false,
          stage: 'Single',
          theme: 'light',
          partner1: '',
          partner2: '',
          region: 'India',
          currency: 'INR',
          dreamGoals: [],
          mindset: 'Balanced',
          invitationAccepted: false,
          selfieUploaded: false,
          selfieUrl: '',
          accountsConnected: false,
          relationshipVerified: false,
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
            spouseName: '',
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