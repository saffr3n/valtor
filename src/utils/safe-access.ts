/**
 * @returns The value of `obj[key]` on success, otherwise the `fallback` value.
 *
 * @internal
 */
export default function safeAccess(
  obj: object,
  key: string | symbol,
  fallback?: unknown,
) {
  try {
    return obj[key as keyof typeof obj];
  } catch {
    return fallback;
  }
}
