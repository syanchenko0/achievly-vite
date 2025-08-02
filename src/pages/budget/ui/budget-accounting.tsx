import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useEffect } from "react";
import { useGetBudgetAccounting } from "@/shared/api";
import {
  useBudgetAccountingStore,
  budgetAccountingStoreCleanup,
} from "@/app/store/budget";
import { BudgetTabs } from "@/shared/constants/budget";
import { ArchiveTabContent } from "@/pages/budget/ui/archive-tab-content";
import { PlannedTabContent } from "@/pages/budget/ui/planned-tab-content";
import { ActualTabContent } from "@/pages/budget/ui/actual-tab-content";

const BudgetAccounting = () => {
  const month = useBudgetAccountingStore((state) => state.month);
  const year = useBudgetAccountingStore((state) => state.year);
  const tab = useBudgetAccountingStore((state) => state.tab);

  const setMonth = useBudgetAccountingStore((state) => state.setMonth);
  const setYear = useBudgetAccountingStore((state) => state.setYear);
  const setTab = useBudgetAccountingStore((state) => state.setTab);

  const { isLoading } = useGetBudgetAccounting({
    params: {
      month,
      year,
    },
  });

  const onTabsChange = (value: string) => {
    setTab(value);

    if (value === BudgetTabs.archive) {
      setMonth((new Date().getMonth() - 1).toString());
    } else if (value === BudgetTabs.planned) {
      setMonth((new Date().getMonth() + 1).toString());
    } else {
      setMonth(new Date().getMonth().toString());
    }

    setYear(new Date().getFullYear().toString());
  };

  useEffect(() => {
    return () => {
      budgetAccountingStoreCleanup();
    };
  }, []);

  return (
    <div className="bg-sidebar size-full overflow-y-hidden rounded-md border p-4">
      <Tabs
        value={tab}
        defaultValue={BudgetTabs.actual}
        onValueChange={onTabsChange}
        className="size-full max-h-full"
      >
        <TabsList>
          <TabsTrigger disabled={isLoading} value={BudgetTabs.archive}>
            Архив
          </TabsTrigger>
          <TabsTrigger disabled={isLoading} value={BudgetTabs.actual}>
            Факт
          </TabsTrigger>
          <TabsTrigger disabled={isLoading} value={BudgetTabs.planned}>
            План
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value={BudgetTabs.archive}
          className="size-full max-h-full min-h-0"
        >
          <ArchiveTabContent />
        </TabsContent>
        <TabsContent
          value={BudgetTabs.actual}
          className="size-full max-h-full min-h-0"
        >
          <ActualTabContent />
        </TabsContent>
        <TabsContent
          value={BudgetTabs.planned}
          className="size-full max-h-full min-h-0"
        >
          <PlannedTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { BudgetAccounting };
