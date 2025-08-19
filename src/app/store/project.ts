import { create } from "zustand";
import { PROJECT_TASK_GROUP_BY } from "@/shared/constants/projects";
import type { ProjectColumn } from "@/shared/api";

interface ProjectState {
  groupBy: string | null;
  setGroupBy: (value: string) => void;
}

interface ProjectTasksState {
  columns: ProjectColumn[];
  setColumns: (value: ProjectColumn[]) => void;
}

const useProjectStore = create<ProjectState>((set) => ({
  groupBy: localStorage.getItem("group_by") ?? PROJECT_TASK_GROUP_BY.NONE,
  setGroupBy: (value) => {
    localStorage.setItem("group_by", value);
    set({ groupBy: value });
  },
}));

const useProjectTasksStore = create<ProjectTasksState>((set) => ({
  columns: [],
  setColumns: (value) => {
    set({ columns: value });
  },
}));

export { useProjectStore, useProjectTasksStore };
