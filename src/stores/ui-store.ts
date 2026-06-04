import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface UiState {
  theme: Theme;
  sidebarCollapsed: boolean;
  model: string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setModel: (model: string) => void;
}

/** Light global UI state, persisted to localStorage. */
export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "light",
      sidebarCollapsed: false,
      model: "flash",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setModel: (model) => set({ model }),
    }),
    { name: "thothai-ui" },
  ),
);
