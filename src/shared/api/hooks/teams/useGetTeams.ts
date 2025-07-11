/**
 * Generated by Kubb (https://kubb.dev/).
 * Do not edit manually.
 */

import client from "@/shared/api/axios-client";
import type {
  RequestConfig,
  ResponseErrorConfig,
} from "@/shared/api/axios-client";
import type {
  QueryKey,
  QueryClient,
  QueryObserverOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import type {
  GetTeamsQueryResponse,
  GetTeams400,
} from "../../models/teams/GetTeams";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getTeamsQueryKey = () => [{ url: "/teams" }] as const;

export type GetTeamsQueryKey = ReturnType<typeof getTeamsQueryKey>;

/**
 * @summary Get teams by user id
 * {@link /teams}
 */
export async function getTeams(
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config;

  const res = await request<
    GetTeamsQueryResponse,
    ResponseErrorConfig<GetTeams400>,
    unknown
  >({ method: "GET", url: `/teams`, ...requestConfig });
  return res.data;
}

export function getTeamsQueryOptions(
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = getTeamsQueryKey();
  return queryOptions<
    GetTeamsQueryResponse,
    ResponseErrorConfig<GetTeams400>,
    GetTeamsQueryResponse,
    typeof queryKey
  >({
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal;
      return getTeams(config);
    },
  });
}

/**
 * @summary Get teams by user id
 * {@link /teams}
 */
export function useGetTeams<
  TData = GetTeamsQueryResponse,
  TQueryData = GetTeamsQueryResponse,
  TQueryKey extends QueryKey = GetTeamsQueryKey,
>(
  options: {
    query?: Partial<
      QueryObserverOptions<
        GetTeamsQueryResponse,
        ResponseErrorConfig<GetTeams400>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & { client?: QueryClient };
    client?: Partial<RequestConfig> & { client?: typeof client };
  } = {},
) {
  const {
    query: { client: queryClient, ...queryOptions } = {},
    client: config = {},
  } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getTeamsQueryKey();

  const query = useQuery(
    {
      ...(getTeamsQueryOptions(config) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<GetTeams400>> & {
    queryKey: TQueryKey;
  };

  query.queryKey = queryKey as TQueryKey;

  return query;
}
