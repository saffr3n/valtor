import type { Validator, ValidatorState } from '../validator';

import type { IValidator } from '../validator'; // eslint-disable-line

export interface EqualityOptions {
  /**
   * Indicates that a `deep` equality check must be performed, allowing to
   * compare nested objects and arrays recursively.
   *
   * @defaultValue `false`
   */
  deep?: boolean;
}

/** @internal */
interface IsEqual<Return, State extends ValidatorState> {
  /**
   * Asserts that the validated value is equal to the provided `value`.
   *
   * @param value - The value to compare against.
   * @param options - Optional settings.
   * @returns The same {@link Validator} instance with its state updated.
   */
  isEqual<const Value extends Return>(
    value: Value,
    options?: EqualityOptions,
  ): Validator<Value, State>;
}

/** @internal */
interface NotEqual<Return, State extends ValidatorState> {
  /**
   * Asserts that the validated value is _not_ equal to the provided `value`.
   *
   * @param value - The value to compare against.
   * @param options - Optional settings.
   * @returns The same {@link Validator} instance with its state updated.
   */
  notEqual<const Value extends Return>(
    value: Value,
    options?: EqualityOptions,
  ): Validator<Exclude<Return, Value>, State>;
}

/** @internal */
interface IsIn<Return, State extends ValidatorState> {
  /**
   * Asserts that the validated value is one of the provided `values`.
   *
   * @param values - The array of values to compare against.
   * @param options - Optional settings.
   * @returns The same {@link Validator} instance with its state updated.
   */
  isIn<const Values extends readonly Return[]>(
    values: Values,
    options?: EqualityOptions,
  ): Validator<Values[number], State>;
}

/** @internal */
interface NotIn<Return, State extends ValidatorState> {
  /**
   * Asserts that the validated value is _not_ any of the provided `values`.
   *
   * @param values - The array of values to compare against.
   * @param options - Optional settings.
   * @returns The same {@link Validator} instance with its state updated.
   */
  notIn<const Values extends readonly Return[]>(
    values: Values,
    options?: EqualityOptions,
  ): Validator<Exclude<Return, Values[number]>, State>;
}

/**
 * Groups all equality-related methods.
 *
 * @remarks Extended by {@link IValidator}.
 *
 * @internal
 */
export interface IEqualityMethods<Return, State extends ValidatorState>
  extends IsEqual<Return, State>,
    NotEqual<Return, State>,
    IsIn<Return, State>,
    NotIn<Return, State> {}

/**
 * Mixes equality-related methods into the validation chain when appropriate.
 *
 * @remarks Extended by {@link Validator}.
 *
 * @internal
 */
export type EqualityMethods<
  Return,
  State extends ValidatorState,
> = IEqualityMethods<Return, State>;
