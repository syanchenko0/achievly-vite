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

export { PROJECT_TASK_PRIORITY, PROJECT_TASK_PRIORITY_LABELS };
