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
  if (!Object.hasOwn(obj, key)) return fallback;
  try {
    return obj[key as keyof typeof obj];
  } catch {
    return fallback;
  }
}
