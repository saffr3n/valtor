import type { IValidator, Validator, ValidatorState } from '../validator';
import type {
  Defined,
  Extract,
  IsPossibly,
  NonNullable,
  Override,
} from '../utils/types';

export interface NullableOptions {
  /**
   * Allows `null` to not be treated as the absence of a value.
   *
   * @default false
   */
  allowNull?: boolean;
}

/** @internal */
interface SetFallback<Return, State extends ValidatorState> {
  /**
   * Sets a fallback `value` if the validated value is missing.
   *
   * @param value - The fallback value.
   *
   * @param options - Optional settings.
   *
   * @returns The same {@link Validator} instance with its state updated.
   */
  setFallback<Options extends NullableOptions>(
    value: RequiredReturn<Return, Options>,
    options?: Options,
  ): Validator<
    RequiredReturn<Return, Options>,
    Override<State, { canSetFallback: false; isNullableApplied: true }>
  >;
}

/** @internal */
interface IsRequired<Return, State extends ValidatorState> {
  /**
   * Marks the validated value as required (non-missing).
   *
   * @param options - Optional settings.
   *
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

/** @internal */
interface IsMissing<Return, State extends ValidatorState> {
  /**
   * Marks the validated value as missing (`null` or `undefined`).
   *
   * @param options - Optional settings.
   *
   * @returns The same {@link Validator} instance with its state updated.
   */
  isMissing<Options extends NullableOptions>(
    options?: Options,
  ): Validator<
    Extract<
      Return,
      Options['allowNull'] extends true ? undefined : null | undefined
    >,
    Override<State, { isNullableApplied: true; canSetFallback: false }>
  >;
}

/** @internal */
interface NotMissing<Return, State extends ValidatorState> {
  /**
   * Marks the validated value as required (non-missing).
   *
   * @param options - Optional settings.
   *
   * @returns The same {@link Validator} instance with its state updated.
   */
  notMissing<Options extends NullableOptions>(
    options?: Options,
  ): Validator<
    RequiredReturn<Return, Options>,
    Override<State, { isNullableApplied: true }>
  >;
}

/**
 * Groups all nullable-related methods.
 *
 * Extended by {@link IValidator}.
 *
 * @internal
 */
export interface INullableMethods<Return, State extends ValidatorState>
  extends SetFallback<Return, State>,
    IsRequired<Return, State>,
    NotRequired<Return, State>,
    IsMissing<Return, State>,
    NotMissing<Return, State> {}

/**
 * Mixes nullable-related methods into the validation chain when appropriate.
 *
 * Extended by {@link Validator}.
 *
 * @internal
 */
export type NullableMethods<
  Return,
  State extends ValidatorState,
> = (State['canSetFallback'] extends true ? SetFallback<Return, State> : {})
  & (State['isNullableApplied'] extends true
    ? {}
    : IsPossibly<null | undefined, Return> extends true
      ? IsRequired<Return, State>
          & NotRequired<Return, State>
          & IsMissing<Return, State>
          & NotMissing<Return, State>
      : {});

/**
 * Excludes `undefined` and `null` (unless
 * {@link NullableOptions.allowNull | Options.allowNull} = `true`) from the
 * `Return` type.
 *
 * @internal
 */
export type RequiredReturn<
  Return,
  Options extends NullableOptions,
> = Options['allowNull'] extends true ? Defined<Return> : NonNullable<Return>;
