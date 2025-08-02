import { create } from "zustand";
import { BudgetTabs } from "@/shared/constants/budget";

interface BudgetAccountingState {
  month: string;
  year: string;
  tab: string;
  setMonth: (value: string) => void;
  setYear: (value: string) => void;
  setTab: (value: string) => void;
}

const budgetAccountingStoreCleanup = () => {
  useBudgetAccountingStore
    .getState()
    .setMonth(new Date().getMonth().toString());
  useBudgetAccountingStore
    .getState()
    .setYear(new Date().getFullYear().toString());
  useBudgetAccountingStore.getState().setTab(BudgetTabs.actual);
};

const useBudgetAccountingStore = create<BudgetAccountingState>((set) => ({
  month: new Date().getMonth().toString(),
  year: new Date().getFullYear().toString(),
  tab: BudgetTabs.actual,
  setMonth: (value) => {
    set({ month: value });
  },
  setYear: (value) => {
    set({ year: value });
  },
  setTab: (value) => {
    set({ tab: value });
  },
}));

export { useBudgetAccountingStore, budgetAccountingStoreCleanup };
