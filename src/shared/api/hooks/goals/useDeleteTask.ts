/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from "@/shared/api/axios-client";
import type {
  RequestConfig,
  ResponseErrorConfig,
} from "@/shared/api/axios-client";
import type { UseMutationOptions, QueryClient } from "@tanstack/react-query";
import type {
  DeleteTaskMutationResponse,
  DeleteTaskPathParams,
  DeleteTask400,
} from "../../models/goals/DeleteTask";
import { useMutation } from "@tanstack/react-query";

export const deleteTaskMutationKey = () =>
  [{ url: "/goals/tasks/{task_id}" }] as const;

export type DeleteTaskMutationKey = ReturnType<typeof deleteTaskMutationKey>;

/**
 * @summary Delete task
 * {@link /goals/tasks/:task_id}
 */
export async function deleteTask(
  { task_id }: { task_id: DeleteTaskPathParams["task_id"] },
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config;

  const res = await request<
    DeleteTaskMutationResponse,
    ResponseErrorConfig<DeleteTask400>,
    unknown
  >({
    method: "DELETE",
    url: `/goals/tasks/${task_id}`,
    ...requestConfig,
  });
  return res.data;
}

/**
 * @summary Delete task
 * {@link /goals/tasks/:task_id}
 */
export function useDeleteTask<TContext>(
  options: {
    mutation?: UseMutationOptions<
      DeleteTaskMutationResponse,
      ResponseErrorConfig<DeleteTask400>,
      { task_id: DeleteTaskPathParams["task_id"] },
      TContext
    > & {
      client?: QueryClient;
    };
    client?: Partial<RequestConfig> & { client?: typeof client };
  } = {},
) {
  const { mutation = {}, client: config = {} } = options ?? {};
  const { client: queryClient, ...mutationOptions } = mutation;
  const mutationKey = mutationOptions.mutationKey ?? deleteTaskMutationKey();

  return useMutation<
    DeleteTaskMutationResponse,
    ResponseErrorConfig<DeleteTask400>,
    { task_id: DeleteTaskPathParams["task_id"] },
    TContext
  >(
    {
      mutationFn: async ({ task_id }) => {
        return deleteTask({ task_id }, config);
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  );
}
