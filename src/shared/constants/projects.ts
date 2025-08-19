const PROJECT_TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

const PROJECT_TASK_PRIORITY_LABELS = {
  [PROJECT_TASK_PRIORITY.LOW]: "Низкий приоритет",
  [PROJECT_TASK_PRIORITY.MEDIUM]: "Средний приоритет",
  [PROJECT_TASK_PRIORITY.HIGH]: "Высокий приоритет",
  [PROJECT_TASK_PRIORITY.CRITICAL]: "Критический приоритет",
} as const;

const PROJECT_TASK_GROUP_BY = {
  NONE: "NONE",
  ASSIGNEE: "ASSIGNEE",
  PARENT_TASK: "PARENT_TASK",
} as const;

const PROJECT_TASK_GROUP_BY_LABELS = {
  NONE: "Без группировки",
  ASSIGNEE: "По исполнителю",
  PARENT_TASK: "По родительской задаче",
} as const;

export {
  PROJECT_TASK_PRIORITY,
  PROJECT_TASK_PRIORITY_LABELS,
  PROJECT_TASK_GROUP_BY,
  PROJECT_TASK_GROUP_BY_LABELS,
};
