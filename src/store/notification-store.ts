import { create } from "zustand";

interface NotificationStore {
  unSeenRequest: number;
  increment: () => void;
  reset: () => void;
  decrement: () => void;
  set: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unSeenRequest: 0,
  increment: () => set((state) => ({ unSeenRequest: state.unSeenRequest + 1 })),
  decrement: () => set((state) => ({ unSeenRequest: Math.max(state.unSeenRequest - 1, 0) })),
  reset: () => set({ unSeenRequest: 0 }),
  set: (count) => set({ unSeenRequest: count }),
}));
