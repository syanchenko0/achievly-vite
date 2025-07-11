/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import { projectColumnSchema } from "./projectColumnSchema";
import { z } from "zod";
import { ZOD_ERROR } from "@/shared/constants/errors";

export const updateProjectTaskBodySchema = z.object({
  name: z
    .string(ZOD_ERROR)
    .describe("Наименование задачи")
    .nullable()
    .nullish(),
  description: z
    .string(ZOD_ERROR)
    .describe("Описание задачи")
    .nullable()
    .nullish(),
  column: z
    .lazy(() => projectColumnSchema)
    .describe("Столбец задачи")
    .nullable()
    .nullish(),
  priority: z
    .string(ZOD_ERROR)
    .describe("Приоритет задачи")
    .nullable()
    .nullish(),
  executor_member_id: z
    .number()
    .describe("ID исполнителя задачи")
    .nullable()
    .nullish(),
  deadline_date: z
    .string(ZOD_ERROR)
    .describe("Дедлайн задачи")
    .nullable()
    .nullish(),
  done_date: z
    .string(ZOD_ERROR)
    .describe("Дата завершения задачи")
    .nullable()
    .nullish(),
});

export type UpdateProjectTaskBodySchema = z.infer<
  typeof updateProjectTaskBodySchema
>;
