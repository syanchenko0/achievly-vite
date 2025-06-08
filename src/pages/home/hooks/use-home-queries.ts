import {
  useGetEvents,
  useGetGoalsGeneralInfo,
  useGetProjectsGeneralInfo,
} from "@/shared/api";
import { useTeamSettingsStore } from "@/app/store/team";
import { addDays, format } from "date-fns";

const useHomeQueries = () => {
  const activeTeamId = useTeamSettingsStore((state) => state.activeTeamId);

  const { data: projectsGeneralInfo } = useGetProjectsGeneralInfo(
    {
      params: { team_id: Number(activeTeamId) },
    },
    { query: { enabled: !!activeTeamId } },
  );

  const { data: goalsGeneralInfo } = useGetGoalsGeneralInfo();

  const { data: eventsToday } = useGetEvents({
    params: {
      start_period: format(new Date(), "yyyy-MM-dd"),
      end_period: format(addDays(new Date(), 1), "yyyy-MM-dd"),
    },
  });

  return {
    projectsGeneralInfo,
    goalsGeneralInfo,
    eventsToday: (eventsToday ?? []).sort(
      (a, b) => a.start_timestamp - b.start_timestamp,
    ),
  };
};

export { useHomeQueries };
