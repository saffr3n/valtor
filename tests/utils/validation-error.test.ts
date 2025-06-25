import { describe, it, expect } from '@jest/globals';
import ValidationError from '../../src/utils/validation-error';

describe('ValidationError', () => {
  it('sets message and name correctly', () => {
    const msg = 'test';
    const err = new ValidationError(msg);
    expect(err.message).toBe(msg);
    expect(err.name).toBe('ValidationError');
  });

  it("is instance of both 'ValidationError' and 'Error'", () => {
    const err = new ValidationError('test');
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toBeInstanceOf(Error);
  });

  it('captures stack trace in environment that supports it', () => {
    const err = new ValidationError('test');
    expect(typeof err.stack).toBe('string');
    expect(err.stack).toContain('ValidationError');
  });
});
