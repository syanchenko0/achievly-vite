import { z } from "zod";
import { ZOD_ERROR } from "@/shared/constants/errors";

const updateBudgetItemSchema = z.object({
  id: z.number(ZOD_ERROR).optional(),
  name: z.string(ZOD_ERROR).nonempty(ZOD_ERROR.required_error),
  value: z
    .number(ZOD_ERROR)
    .min(1, { message: "Значение должно быть больше 0" }),
  date: z.string(ZOD_ERROR).nonempty(ZOD_ERROR.required_error),
  planned: z.boolean(ZOD_ERROR),
});

export { updateBudgetItemSchema };
