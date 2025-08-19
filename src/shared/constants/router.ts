const ROUTES = {
  home: "/",
  auth: "/auth",
  goals_tasks: "/goals/tasks",
  goals_list: "/goals/list",
  goals_statistics: "/goals/statistics",
  events_calendar: "/events/calendar",
  team_join: "/teams/:team_id/join",
  team_settings: "/teams/:team_id/settings",
  project: "/projects/:project_id",
  project_parent_tasks: "/projects/:project_id/parent_tasks",
  budget_accounting: "/budget/accounting",
};

const ROUTE_LABELS = {
  [ROUTES.home]: "Главная",
  [ROUTES.goals_tasks]: "Список задач",
  [ROUTES.goals_list]: "Список целей",
  [ROUTES.goals_statistics]: "Статистика",
  [ROUTES.events_calendar]: "Календарь событий",
  [ROUTES.team_join]: "Присоединиться к команде",
  [ROUTES.team_settings]: "Настройки команды",
  [ROUTES.project]: "Страница проекта",
  [ROUTES.project_parent_tasks]: "Родительские задачи",
  [ROUTES.budget_accounting]: "Учёт бюджета",
};

export { ROUTES, ROUTE_LABELS };
