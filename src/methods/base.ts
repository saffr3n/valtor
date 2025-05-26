import type { Validator, ValidatorState } from '../validator';
import type { NullableOptions, RequiredReturn } from './nullable';
import type { Override } from '../utils/types';

import type { IValidator } from '../validator'; // eslint-disable-line
import type ValidationError from '../utils/validation-error'; // eslint-disable-line

/** @internal */
interface Get<Return> {
  /**
   * Finalizes the validation and retrieves the validated value.
   *
   * @returns The validated value.
   * @throws A {@link ValidationError} if validation fails.
   */
  get(): Return;
}

/** @internal */
interface SetFallback<Return, State extends ValidatorState> {
  /**
   * Sets a fallback `value` if the validated value is missing.
   *
   * @param value - The fallback value.
   * @param options - Optional settings.
   * @returns The same {@link Validator} instance with its state updated.
   */
  setFallback<Options extends NullableOptions>(
    value: RequiredReturn<Return, Options>,
    options?: Options,
  ): Validator<
    RequiredReturn<Return, Options>,
    Override<State, { canSetFallback: false }>
  >;
}

/**
 * Groups all base methods.
 *
 * @remarks Extended by {@link IValidator}.
 *
 * @internal
 */
export interface IBaseMethods<Return, State extends ValidatorState>
  extends Get<Return>,
    SetFallback<Return, State> {}

/**
 * Mixes base methods into the validation chain when appropriate.
 *
 * @remarks Extended by {@link Validator}.
 *
 * @internal
 */
export type BaseMethods<Return, State extends ValidatorState> = Get<Return>
  & (State['canSetFallback'] extends true ? SetFallback<Return, State> : {});
