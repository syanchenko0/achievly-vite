import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function declension(value: number, words: string[]) {
  value = Math.abs(value) % 100;
  const num = value % 10;
  if (value > 10 && value < 20) return words[2];
  if (num > 1 && num < 5) return words[1];
  if (num == 1) return words[0];
  return words[2];
}

type PathParams<T extends string> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof PathParams<Rest>]: string | number }
    : // eslint-disable-next-line @typescript-eslint/no-unused-vars
      T extends `${infer _Start}:${infer Param}`
      ? { [K in Param]: string | number }
      : object;

export function replacePathParams<T extends string>(
  path: T,
  params: PathParams<T>,
): string {
  let result: string = path;

  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, String(value));
  }

  return result;
}

export function groupBy<T, K extends string | number | symbol>(
  items: T[],
  getKey: (item: T) => K,
): Record<K, T[]> {
  return items.reduce<Record<K, T[]>>(
    (acc, item) => {
      const key = getKey(item);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}
