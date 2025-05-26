import type { Validator } from '../validator'; // eslint-disable-line

/**
 * Error thrown by {@link Validator.get | Validator.get()} if validation fails.
 */
export default class ValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
    if ('captureStackTrace' in Error) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
