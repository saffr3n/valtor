import ValidatorImpl, { type Validator } from './validator';
import ValidationError from './utils/validation-error';
import type { NullableOptions } from './methods/nullable';
import type { EqualityOptions } from './methods/equality';

/**
 * Creates a new {@link Validator} instance for the given `value`.
 *
 * @param value - The value to validate.
 * @param name - An optional name for the `value`, used in error messages.
 * @returns A new {@link Validator} instance.
 */
export default function validate<Return>(
  value: Return,
  name?: string,
): Validator<Return> {
  return new ValidatorImpl(value, name);
}

export {
  ValidationError,
  type Validator,
  type NullableOptions,
  type EqualityOptions,
};
