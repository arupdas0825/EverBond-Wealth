import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFinanceStore = create(
  persist(
    (set, get) => ({
      partner1: "",
      partner2: "",
      region: "India",
      currency: "INR",
      p1Salary: 50000,
      p2Salary: 50000,
      mode: "Balanced",
      simYears: 10,
      simReturn: null,
      customGoals: [],
      goalTargets: { child: 5000000, retirement: 20000000, house: 8000000, vacation: 500000 },
      started: false,

      // Selectors
      getTotalSalary: () => get().p1Salary + get().p2Salary,

      // Actions
      setProfile: (info) => set({ ...info, started: true }),
      setP1Salary: (val) => set({ p1Salary: val }),
      setP2Salary: (val) => set({ p2Salary: val }),
      setMode: (mode) => set({ mode }),
      setCurrency: (currency) => set({ currency }),
      setRegion: (region) => set({ region }),
      setSimYears: (simYears) => set({ simYears }),
      setSimReturn: (simReturn) => set({ simReturn }),
      setGoalTargets: (goalTargets) => set({ goalTargets }),
      
      addCustomGoal: (goal) => set((state) => ({ 
        customGoals: [...state.customGoals, { ...goal, id: Date.now() }] 
      })),
      
      removeCustomGoal: (id) => set((state) => ({
        customGoals: state.customGoals.filter((g) => g.id !== id)
      })),

      reset: () => {
        localStorage.removeItem('eb_state_v3'); // Version bump for new schema
        set({
          partner1: "", partner2: "", region: "India", currency: "INR", 
          p1Salary: 50000, p2Salary: 50000, mode: "Balanced",
          simYears: 10, simReturn: null, customGoals: [],
          goalTargets: { child: 5000000, retirement: 20000000, house: 8000000, vacation: 500000 },
          started: false
        });
      }
    }),
    {
      name: 'eb_state_v3',
    }
  )
);
