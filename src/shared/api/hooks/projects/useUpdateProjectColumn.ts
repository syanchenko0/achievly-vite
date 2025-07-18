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
  UpdateProjectColumnMutationRequest,
  UpdateProjectColumnMutationResponse,
  UpdateProjectColumnPathParams,
  UpdateProjectColumn400,
} from "../../models/projects/UpdateProjectColumn";
import { useMutation } from "@tanstack/react-query";

export const updateProjectColumnMutationKey = () =>
  [{ url: "/projects/{project_id}/columns/{column_id}" }] as const;

export type UpdateProjectColumnMutationKey = ReturnType<
  typeof updateProjectColumnMutationKey
>;

/**
 * @summary Update project column
 * {@link /projects/:project_id/columns/:column_id}
 */
export async function updateProjectColumn(
  {
    column_id,
    project_id,
    data,
  }: {
    column_id: UpdateProjectColumnPathParams["column_id"];
    project_id: UpdateProjectColumnPathParams["project_id"];
    data: UpdateProjectColumnMutationRequest;
  },
  config: Partial<RequestConfig<UpdateProjectColumnMutationRequest>> & {
    client?: typeof client;
  } = {},
) {
  const { client: request = client, ...requestConfig } = config;

  const res = await request<
    UpdateProjectColumnMutationResponse,
    ResponseErrorConfig<UpdateProjectColumn400>,
    UpdateProjectColumnMutationRequest
  >({
    method: "PATCH",
    url: `/projects/${project_id}/columns/${column_id}`,
    data,
    ...requestConfig,
  });
  return res.data;
}

/**
 * @summary Update project column
 * {@link /projects/:project_id/columns/:column_id}
 */
export function useUpdateProjectColumn<TContext>(
  options: {
    mutation?: UseMutationOptions<
      UpdateProjectColumnMutationResponse,
      ResponseErrorConfig<UpdateProjectColumn400>,
      {
        column_id: UpdateProjectColumnPathParams["column_id"];
        project_id: UpdateProjectColumnPathParams["project_id"];
        data: UpdateProjectColumnMutationRequest;
      },
      TContext
    > & { client?: QueryClient };
    client?: Partial<RequestConfig<UpdateProjectColumnMutationRequest>> & {
      client?: typeof client;
    };
  } = {},
) {
  const { mutation = {}, client: config = {} } = options ?? {};
  const { client: queryClient, ...mutationOptions } = mutation;
  const mutationKey =
    mutationOptions.mutationKey ?? updateProjectColumnMutationKey();

  return useMutation<
    UpdateProjectColumnMutationResponse,
    ResponseErrorConfig<UpdateProjectColumn400>,
    {
      column_id: UpdateProjectColumnPathParams["column_id"];
      project_id: UpdateProjectColumnPathParams["project_id"];
      data: UpdateProjectColumnMutationRequest;
    },
    TContext
  >(
    {
      mutationFn: async ({ column_id, project_id, data }) => {
        return updateProjectColumn({ column_id, project_id, data }, config);
      },
      mutationKey,
      ...mutationOptions,
    },
    queryClient,
  );
}
