import type {
  ErrorFactory,
  IValidator,
  Validator,
  ValidatorOptions,
  ValidatorState,
} from '../validator';
import type ValidationError from '../utils/validation-error';
import type { Override } from '../utils/types';

/** @internal */
interface Get<Return> {
  /**
   * Finalizes the validation and retrieves the validated value.
   *
   * @returns A {@link Promise} resolving to the validated value.
   *
   * @throws A {@link ValidationError} if validation fails.
   */
  get(): Promise<Return>;
}

/** @internal */
interface Custom<Return, State extends ValidatorState> {
  /**
   * Applies a `custom` transformation or validation step to the current value.
   *
   * @param callback
   * A function that receives the current validated value and can:
   * - return a new or the same value synchronously
   * - return a {@link Promise} resolving to a new or the same value
   * - throw or reject to fail the validation early
   *
   * @returns The same {@link Validator} instance with its state updated.
   */
  custom<NewReturn>(
    callback: (value: Return) => NewReturn | Promise<NewReturn>,
  ): Validator<
    NewReturn,
    Override<
      State,
      {
        canSetError: false;
        canSetFallback: State['canSetFallback'] extends true
          ? NewReturn extends Return
            ? true
            : false
          : false;
      }
    >
  >;
}

/** @internal */
interface WithError<Return, State extends ValidatorState> {
  /**
   * Sets a custom error for the previous method in the chain.
   *
   * @param error
   * One of the following:
   * - a custom message for {@link ValidationError}
   * - a custom {@link Error} instance
   * - a factory function that returns one of the above
   *
   * @returns The same {@link Validator} instance with its state updated.
   *
   * Note that errors provided via this method take precedence over both
   * built-in errors and the {@link ValidatorOptions.error | global error}.
   */
  withError(
    error: string | Error | ErrorFactory<Return>,
  ): Validator<Return, Override<State, { canSetError: false }>>;
}

/**
 * Groups all base methods.
 *
 * Extended by {@link IValidator}.
 *
 * @internal
 */
export interface IBaseMethods<Return, State extends ValidatorState>
  extends Get<Return>,
    Custom<Return, State>,
    WithError<Return, State> {}

/**
 * Mixes base methods into the validation chain when appropriate.
 *
 * Extended by {@link Validator}.
 *
 * @internal
 */
export type BaseMethods<Return, State extends ValidatorState> = Get<Return>
  & Custom<Return, State>
  & (State['canSetError'] extends true ? WithError<Return, State> : {});
