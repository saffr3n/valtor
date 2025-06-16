/**
 * @returns `true` if the `value` is an `ArrayLike<unknown>`, otherwise `false`.
 *
 * @internal
 */
export default function isArrayLike(
  value: unknown,
): value is ArrayLike<unknown> {
  return (
    typeof value === 'object'
    && value !== null
    && 'length' in value
    && typeof value.length === 'number'
    && Number.isInteger(value.length)
    && value.length >= 0
    && Symbol.iterator in value
    && typeof value[Symbol.iterator] === 'function'
  );
}
