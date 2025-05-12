import { create } from "zustand";

interface TeamSettingsState {
  activeTeamId: string | null;
  setActiveTeamId: (id: string) => void;
}

const useTeamSettingsStore = create<TeamSettingsState>((set) => ({
  activeTeamId: localStorage.getItem("active_team_id"),
  setActiveTeamId: (id) => {
    localStorage.setItem("active_team_id", id);
    set({ activeTeamId: id });
  },
}));

export { useTeamSettingsStore };
