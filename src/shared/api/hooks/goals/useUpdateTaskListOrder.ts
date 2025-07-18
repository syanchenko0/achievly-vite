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
  UpdateTaskListOrderMutationRequest,
  UpdateTaskListOrderMutationResponse,
  UpdateTaskListOrder400,
} from "../../models/goals/UpdateTaskListOrder";
import { useMutation } from "@tanstack/react-query";

export const updateTaskListOrderMutationKey = () =>
  [{ url: "/goals/tasks/list_order" }] as const;

export type UpdateTaskListOrderMutationKey = ReturnType<
  typeof updateTaskListOrderMutationKey
>;

/**
 * @summary Update task list order
 * {@link /goals/tasks/list_order}
 */
export async function updateTaskListOrder(
  { data }: { data?: UpdateTaskListOrderMutationRequest },
  config: Partial<RequestConfig<UpdateTaskListOrderMutationRequest>> & {
    client?: typeof client;
  } = {},
) {
  const { client: request = client, ...requestConfig } = config;

  const res = await request<
    UpdateTaskListOrderMutationResponse,
    ResponseErrorConfig<UpdateTaskListOrder400>,
    UpdateTaskListOrderMutationRequest
  >({
    method: "POST",
    url: `/goals/tasks/list_order`,
    data,
    ...requestConfig,
  });
  return res.data;
}

/**
 * @summary Update task list order
 * {@link /goals/tasks/list_order}
 */
export function useUpdateTaskListOrder<TContext>(
  options: {
    mutation?: UseMutationOptions<
      UpdateTaskListOrderMutationResponse,
      ResponseErrorConfig<UpdateTaskListOrder400>,
      { data?: UpdateTaskListOrderMutationRequest },
      TContext
    > & { client?: QueryClient };
    client?: Partial<RequestConfig<UpdateTaskListOrderMutationRequest>> & {
      client?: typeof client;
    };
  } = {},
) {
  const { mutation = {}, client: config = {} } = options ?? {};
  const { client: queryClient, ...mutationOptions } = mutation;
  const mutationKey =
    mutationOptions.mutationKey ?? updateTaskListOrderMutationKey();

  return useMutation<
    UpdateTaskListOrderMutationResponse,
    ResponseErrorConfig<UpdateTaskListOrder400>,
    { data?: UpdateTaskListOrderMutationRequest },
    TContext
  >(
    {
      mutationFn: async ({ data }) => {
        return updateTaskListOrder({ data }, config);
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  );
}
