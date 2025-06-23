import { describe, it, expect } from '@jest/globals';
import isArrayLike from '../../src/utils/is-array-like';

describe('isArrayLike', () => {
  it('accepts native arrays', () => {
    expect(isArrayLike([1, 2])).toBe(true);
  });

  it('accepts typed arrays', () => {
    expect(isArrayLike(new Uint8Array([1, 2]))).toBe(true);
  });

  it('accepts strings (primitive and boxed)', () => {
    expect(isArrayLike('hi')).toBe(true);
    expect(isArrayLike(new String('hi'))).toBe(true);
  });

  it("accepts 'arguments' object", function () {
    expect(isArrayLike(arguments)).toBe(true); // eslint-disable-line
  });

  it('accepts custom iterable with valid length', () => {
    const obj = {
      length: 2,
      [Symbol.iterator]: function* () {
        yield 1;
        yield 2;
      },
    };
    expect(isArrayLike(obj)).toBe(true);
  });

  it('rejects primitives (except strings)', () => {
    expect(isArrayLike(null)).toBe(false);
    expect(isArrayLike(undefined)).toBe(false);
    expect(isArrayLike(true)).toBe(false);
    expect(isArrayLike(42)).toBe(false);
    expect(isArrayLike(42n)).toBe(false);
    expect(isArrayLike(Symbol('hi'))).toBe(false);
  });

  it('rejects invalid length property', () => {
    const obj = { [Symbol.iterator]: () => {} };
    expect(isArrayLike({ ...obj, length: '1' })).toBe(false);
    expect(isArrayLike({ ...obj, length: 1.5 })).toBe(false);
    expect(isArrayLike({ ...obj, length: -1 })).toBe(false);
  });

  it('requires both length and iterator', () => {
    expect(isArrayLike({ length: 0 })).toBe(false);
    expect(isArrayLike({ [Symbol.iterator]: () => {} })).toBe(false);
  });
});
