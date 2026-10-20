import { twMerge } from 'tailwind-merge';

import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Recursively convert every `Date` instance inside a value to an ISO-8601
 * string so Zod schemas that expect `zod.string()` for timestamp fields don't
 * throw when MySQL returns a native `Date` object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeDates<T>(obj: T): T {
  if (obj instanceof Date) return obj.toISOString() as unknown as T;
  if (Array.isArray(obj)) return obj.map(serializeDates) as unknown as T;
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, serializeDates(v)])
    ) as unknown as T;
  }
  return obj;
}
