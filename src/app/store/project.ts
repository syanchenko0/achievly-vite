import { create } from "zustand";
import { PROJECT_TASK_GROUP_BY } from "@/shared/constants/projects";

interface ProjectState {
  groupBy: string | null;
  setGroupBy: (value: string) => void;
}

const useProjectStore = create<ProjectState>((set) => ({
  groupBy: localStorage.getItem("group_by") ?? PROJECT_TASK_GROUP_BY.NONE,
  setGroupBy: (value) => {
    localStorage.setItem("group_by", value);
    set({ groupBy: value });
  },
}));

export { useProjectStore };
