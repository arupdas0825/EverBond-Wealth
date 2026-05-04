import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      // Onboarding
      started:   false,
      partner1:  '',
      partner2:  '',
      region:    'India',
      currency:  'INR',

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
      setProfile: ({ partner1, partner2, region, currency }) =>
        set({ started: true, partner1, partner2, region, currency }),

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
        const { p1Salary, p2Salary } = get();
        return (p1Salary || 0) + (p2Salary || 0);
      },

      reset: () => {
        set({
          started: false, partner1: '', partner2: '',
          region: 'India', currency: 'INR',
          p1Salary: 100000, p2Salary: 0,
          mode: 'Balanced', simYears: 10, simReturn: null,
          milestones: [],
          goalTargets: {
            child: 5000000, retirement: 20000000,
            house: 8000000, vacation: 500000,
          },
        });
      },
    }),
    { name: 'eb_v5' }
  )
);