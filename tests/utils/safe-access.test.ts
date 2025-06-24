import { describe, it, expect } from '@jest/globals';
import safeAccess from '../../src/utils/safe-access';

describe('safeAccess', () => {
  it('reads existing properties', () => {
    expect(safeAccess({ foo: 42 }, 'foo')).toBe(42);
    const sym = Symbol('foo');
    expect(safeAccess({ [sym]: 42 }, sym)).toBe(42);
  });

  it('returns fallback for missing keys', () => {
    expect(safeAccess({ foo: 42 }, 'bar', 'fb')).toBe('fb');
    expect(safeAccess({ foo: 42 }, Symbol('foo'), 'fb')).toBe('fb');
  });

  it('returns fallback on thrown getters', () => {
    const obj = {
      get bad() {
        throw new Error();
      },
    };
    expect(safeAccess(obj, 'bad', 'fb')).toBe('fb');
  });

  it('handles functions', () => {
    const fn: { (): void; foo?: number } = () => {};
    fn.foo = 42;
    expect(safeAccess(fn, 'foo')).toBe(42);
    Object.defineProperty(fn, 'bar', {
      get() {
        throw new Error();
      },
    });
    expect(safeAccess(fn, 'bar', 'fn')).toBe('fn');
  });

  it('handles arrays', () => {
    const arr = [42];
    expect(safeAccess(arr, '0')).toBe(42);
    Object.defineProperty(arr, '1', {
      get() {
        throw new Error();
      },
    });
    expect(safeAccess(arr, '1', 'fb')).toBe('fb');
  });
});
