import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMilestoneStore = create(
  persist(
    (set, get) => ({
      milestones: [],
      
      addMilestone: (milestone) => set((state) => ({
        milestones: [...state.milestones, { ...milestone, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
      })),
      
      updateMilestone: (id, updates) => set((state) => ({
        milestones: state.milestones.map((m) => m.id === id ? { ...m, ...updates } : m)
      })),
      
      deleteMilestone: (id) => set((state) => ({
        milestones: state.milestones.filter((m) => m.id !== id)
      })),
    }),
    {
      name: 'everbond-milestones',
    }
  )
);
