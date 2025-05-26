/**
 * Checks if `T` is either `any` or `unknown`.
 *
 * @internal
 */
export type IsUnknown<T> = unknown extends T ? true : false;

/**
 * Extracts from `T` those types that are assignable to `U`.
 *
 * @remarks
 * Note that this is not the standard `Extract` type.
 * It allows _extracting_ from broad types, such as `any`, `unknown` or `{}`.
 *
 * @internal
 */
export type Extract<T, U> =
  IsUnknown<T> extends true
    ? U
    : T extends U
      ? T
      : {} extends T
        ? NonNullable<U>
        : never;

/**
 * Excludes from `T` those types that are assignable to `U`.
 *
 * @remarks
 * Note that this is not the standard `Exclude` type.
 * It allows _excluding_ `null` and `undefined` from `any` and `unknown`.
 *
 * @internal
 */
export type Exclude<T, U> =
  IsUnknown<T> extends true
    ? [Extract<U, null>] extends [never]
      ? [Extract<U, undefined>] extends [never]
        ? T
        : {} | null
      : [Extract<U, undefined>] extends [never]
        ? {} | undefined
        : {}
    : T extends U
      ? never
      : T;

/**
 * Excludes `undefined` from `T`.
 *
 * @remarks
 * Note that `{}` represents any non-nullable type, so `{} | null` is used to
 * represent a non-`undefined` version of `any` or `unknown`.
 *
 * @internal
 */
export type Defined<T> = Exclude<T, undefined>;

/**
 * Excludes `null` and `undefined` from `T`.
 *
 * @remarks
 * Note that this is not the standard `NonNullable` type.
 * `NonNullable<any>` or `NonNullable<unknown>` produce `{}`.
 *
 * @internal
 */
export type NonNullable<T> = Exclude<T, null | undefined>;

/**
 * Checks if `U` is _possibly_ of type `T`.
 *
 * @remarks
 * - If `U` is `any` or `unknown`, then it's possible.
 * - If extracting `T` from `U` yields `never`, then `U` doesn't contain `T`.
 * - If excluding `T` from `U` yields `never`, then `U` is exactly `T`.
 * - Otherwise, `U` is a union that is partly `T`, so it's _possibly_ `T`.
 *
 * @internal
 */

export type IsPossibly<T, U> =
  IsUnknown<U> extends true
    ? true
    : [Extract<U, T>] extends [never]
      ? false
      : [Exclude<U, T>] extends [never]
        ? false
        : true;

/**
 * Overrides properties of `T` with overlapping properties of `U`.
 *
 * @internal
 */
export type Override<T, U extends { [K in keyof T]?: unknown }> = U
  & Omit<T, keyof U>;
