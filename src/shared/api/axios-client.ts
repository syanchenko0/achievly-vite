import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from "axios";
import { ROUTES } from "@/shared/constants/router";

export type RequestConfig<TVariables = unknown> = {
  method: Method;
  url: string;
  params?: unknown;
  data?: TVariables;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  signal?: AbortSignal;
  headers?: AxiosRequestConfig["headers"];
};

export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
  headers?: AxiosResponse["headers"];
};

export type ResponseErrorConfig<TError = unknown> = AxiosError<TError>;

export const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_BASE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  return config;
});

axiosInstance.interceptors.response.use(
  (config) => config,
  async (error) => {
    if (
      error?.response?.status === 401 &&
      error.config &&
      !error.config._isRetry
    ) {
      window.location.href = ROUTES.auth;
    }

    throw error;
  },
);

export const axiosClient = async <
  TData,
  TError = unknown,
  TVariables = unknown,
>(
  config: RequestConfig<TVariables>,
): Promise<ResponseConfig<TData>> => {
  return axiosInstance
    .request<TData>({ ...config })
    .then((response) => response)
    .catch((error: AxiosError<TError>) => {
      throw error;
    });
};

export default axiosClient;
