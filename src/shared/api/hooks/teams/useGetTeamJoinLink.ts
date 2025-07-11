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
  GetTeamJoinLinkQueryResponse,
  GetTeamJoinLinkPathParams,
  GetTeamJoinLink400,
} from "../../models/teams/GetTeamJoinLink";
import { queryOptions, useQuery } from "@tanstack/react-query";

export const getTeamJoinLinkQueryKey = ({
  team_id,
}: {
  team_id: GetTeamJoinLinkPathParams["team_id"];
}) =>
  [{ url: "/teams/:team_id/join-link", params: { team_id: team_id } }] as const;

export type GetTeamJoinLinkQueryKey = ReturnType<
  typeof getTeamJoinLinkQueryKey
>;

/**
 * @summary Get team join link
 * {@link /teams/:team_id/join-link}
 */
export async function getTeamJoinLink(
  { team_id }: { team_id: GetTeamJoinLinkPathParams["team_id"] },
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const { client: request = client, ...requestConfig } = config;

  const res = await request<
    GetTeamJoinLinkQueryResponse,
    ResponseErrorConfig<GetTeamJoinLink400>,
    unknown
  >({
    method: "GET",
    url: `/teams/${team_id}/join-link`,
    ...requestConfig,
  });
  return res.data;
}

export function getTeamJoinLinkQueryOptions(
  { team_id }: { team_id: GetTeamJoinLinkPathParams["team_id"] },
  config: Partial<RequestConfig> & { client?: typeof client } = {},
) {
  const queryKey = getTeamJoinLinkQueryKey({ team_id });
  return queryOptions<
    GetTeamJoinLinkQueryResponse,
    ResponseErrorConfig<GetTeamJoinLink400>,
    GetTeamJoinLinkQueryResponse,
    typeof queryKey
  >({
    enabled: !!team_id,
    queryKey,
    queryFn: async ({ signal }) => {
      config.signal = signal;
      return getTeamJoinLink({ team_id }, config);
    },
  });
}

/**
 * @summary Get team join link
 * {@link /teams/:team_id/join-link}
 */
export function useGetTeamJoinLink<
  TData = GetTeamJoinLinkQueryResponse,
  TQueryData = GetTeamJoinLinkQueryResponse,
  TQueryKey extends QueryKey = GetTeamJoinLinkQueryKey,
>(
  { team_id }: { team_id: GetTeamJoinLinkPathParams["team_id"] },
  options: {
    query?: Partial<
      QueryObserverOptions<
        GetTeamJoinLinkQueryResponse,
        ResponseErrorConfig<GetTeamJoinLink400>,
        TData,
        TQueryData,
        TQueryKey
      >
    > & {
      client?: QueryClient;
    };
    client?: Partial<RequestConfig> & { client?: typeof client };
  } = {},
) {
  const {
    query: { client: queryClient, ...queryOptions } = {},
    client: config = {},
  } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ?? getTeamJoinLinkQueryKey({ team_id });

  const query = useQuery(
    {
      ...(getTeamJoinLinkQueryOptions(
        { team_id },
        config,
      ) as unknown as QueryObserverOptions),
      queryKey,
      ...(queryOptions as unknown as Omit<QueryObserverOptions, "queryKey">),
    },
    queryClient,
  ) as UseQueryResult<TData, ResponseErrorConfig<GetTeamJoinLink400>> & {
    queryKey: TQueryKey;
  };

  query.queryKey = queryKey as TQueryKey;

  return query;
}
