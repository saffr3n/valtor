import type { Validator, ValidatorState } from '../validator';
import type { Defined, IsPossibly, Override } from '../utils/types';

import type { IValidator } from '../validator'; // eslint-disable-line

export interface NullableOptions {
  /**
   * Allows `null` to not be treated as the absence of a value.
   *
   * @defaultValue `false`
   */
  allowNull?: boolean;
}

/** @internal */
interface IsRequired<Return, State extends ValidatorState> {
  /**
   * Marks the validated value as required (non-missing).
   *
   * @param options - Optional settings.
   * @returns The same {@link Validator} instance with its state updated.
   */
  isRequired<Options extends NullableOptions>(
    options?: Options,
  ): Validator<
    RequiredReturn<Return, Options>,
    Override<State, { isNullableApplied: true }>
  >;
}

/** @internal */
interface NotRequired<Return, State extends ValidatorState> {
  /**
   * Marks the validated value as explicitly _not_ required (may be missing).
   *
   * @returns The same {@link Validator} instance with its state updated.
   */
  notRequired(): Validator<
    Return,
    Override<State, { isNullableApplied: true }>
  >;
}

/**
 * Groups all nullable-related methods.
 *
 * @remarks Extended by {@link IValidator}.
 *
 * @internal
 */
export interface INullableMethods<Return, State extends ValidatorState>
  extends IsRequired<Return, State>,
    NotRequired<Return, State> {}

/**
 * Mixes nullable-related methods into the validation chain when appropriate.
 *
 * @remarks Extended by {@link Validator}.
 *
 * @internal
 */
export type NullableMethods<
  Return,
  State extends ValidatorState,
> = State['isNullableApplied'] extends true
  ? {}
  : IsPossibly<null | undefined, Return> extends true
    ? INullableMethods<Return, State>
    : {};

/**
 * Excludes `undefined` and `null` (unless {@link Options.allowNull} = `true`)
 * from the `Return` type.
 *
 * @internal
 */
export type RequiredReturn<
  Return,
  Options extends NullableOptions,
> = Options['allowNull'] extends true ? Defined<Return> : NonNullable<Return>;
