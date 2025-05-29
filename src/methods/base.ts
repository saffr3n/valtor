import type { IValidator, Validator } from '../validator'; // eslint-disable-line
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

/**
 * Groups all base methods.
 *
 * @remarks Extended by {@link IValidator}.
 *
 * @internal
 */
export interface IBaseMethods<Return> extends Get<Return> {}

/**
 * Mixes base methods into the validation chain when appropriate.
 *
 * @remarks Extended by {@link Validator}.
 *
 * @internal
 */
export type BaseMethods<Return> = Get<Return>;
