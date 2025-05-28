/** @internal */
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
