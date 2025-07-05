import ValidatorImpl, {
  type ErrorFactory,
  type Validator,
  type ValidatorOptions,
} from './validator';
import ValidationError from './utils/validation-error';
import type { NullableOptions } from './methods/nullable';
import type { EqualityOptions } from './methods/equality';

/**
 * Creates a new {@link Validator} instance for the given `value`.
 *
 * @param value - The value to validate.
 *
 * @param options - Optional settings.
 *
 * @returns A new {@link Validator} instance.
 */
export default function validate<Return>(
  value: Return,
  options?: ValidatorOptions<Return>,
) {
  return new ValidatorImpl(value, options) as Validator<Return>;
}

export {
  ValidationError,
  type ErrorFactory,
  type Validator,
  type ValidatorOptions,
  type NullableOptions,
  type EqualityOptions,
};
