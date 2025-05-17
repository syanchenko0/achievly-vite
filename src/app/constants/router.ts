const ROUTES = {
  home: "/",
  auth: "/auth",
  goals_list: "/goals/list",
  goals_statistics: "/goals/statistics",
  calendar: "/calendar",
  projects_list: "/projects/list",
  budget_records: "/budget/records",
  teams_settings: "/teams/settings",
  join_team: "/teams/:id/join",
};

const ROUTE_LABELS = {
  [ROUTES.home]: "Главная",
  [ROUTES.teams_settings]: "Настройки команд",
  [ROUTES.goals_list]: "Список целей",
  [ROUTES.goals_statistics]: "Статистика",
  [ROUTES.calendar]: "Календарь",
  [ROUTES.projects_list]: "Список проектов",
  [ROUTES.budget_records]: "Учет",
  [ROUTES.join_team]: "Присоединиться к команде",
};

export { ROUTES, ROUTE_LABELS };
