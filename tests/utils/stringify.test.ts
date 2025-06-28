import { describe, it, expect } from '@jest/globals';
import stringify from '../../src/utils/stringify';

describe('stringify', () => {
  it('handles primitives', () => {
    expect(stringify(null)).toBe('null');
    expect(stringify(undefined)).toBe('undefined');
    expect(stringify(true)).toBe('true');
    expect(stringify(false)).toBe('false');
    expect(stringify(42)).toBe('42');
    expect(stringify(42n)).toBe('42n');
    expect(stringify('test')).toBe('"test"');
    expect(stringify(Symbol('s'))).toBe('Symbol(s)');
  });

  it("handles boxed 'string', 'number' and 'boolean'", () => {
    expect(stringify(new Boolean(true))).toBe('true');
    expect(stringify(new Boolean(false))).toBe('false');
    expect(stringify(new Number(42))).toBe('42');
    expect(stringify(new String('test'))).toBe('"test"');
  });

  it("handles 'RegExp'", () => {
    expect(stringify(/a/i)).toBe('/a/i');
    expect(stringify(/a/)).toBe('/a/');
  });

  it("handles 'Date'", () => {
    const date = new Date(1000);
    expect(stringify(date)).toBe(date.toISOString());
  });

  it('handles both named and anonymous functions', () => {
    const named = () => {};
    expect(stringify(named)).toBe('[Function: named]');
    expect(stringify(() => {})).toBe('[Function (anonymous)]');
  });

  it("handles 'ArrayBuffer' and 'DataView'", () => {
    const buf = new Uint8Array([1, 2, 3]).buffer;
    const dv = new DataView(buf);
    expect(stringify(buf)).toBe('[ArrayBuffer(3)] [\n  1,\n  2,\n  3\n]');
    expect(stringify(dv)).toBe('[DataView(3)] [\n  1,\n  2,\n  3\n]');
  });

  it('handles typed arrays', () => {
    const arr = new Uint8Array([1, 2, 3]);
    expect(stringify(arr)).toBe('[Uint8Array(3)] [\n  1,\n  2,\n  3\n]');
  });

  it('handles array-like structures', () => {
    const arr = [1, 2, 3];
    expect(stringify(arr)).toBe('[Array(3)] [\n  1,\n  2,\n  3\n]');

    const args = (function () {
      return arguments; // eslint-disable-line
      // @ts-expect-error testing arguments object
    })(1, 2, 3);
    expect(stringify(args)).toBe('[Object(3)] [\n  1,\n  2,\n  3\n]');
  });

  it("handles 'Set'", () => {
    const set = new Set([1, 2, 3]);
    expect(stringify(set)).toBe('[Set(3)] {\n  1,\n  2,\n  3\n}');
  });

  it("handles 'Map'", () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    expect(stringify(map)).toBe('[Map(2)] {\n  "a": 1,\n  "b": 2\n}');
  });

  it("handles 'WeakSet' and 'WeakMap'", () => {
    expect(stringify(new WeakSet())).toBe('[WeakSet (items unknown)]');
    expect(stringify(new WeakMap())).toBe('[WeakMap (items unknown)]');
  });

  it('handles error objects', () => {
    const err: Error & { foo?: unknown } = new Error('oops');
    err.foo = 42;
    expect(stringify(err)).toBe('[Error: oops] {\n  foo: 42\n}');
  });

  it('handles plain objects', () => {
    const sym = Symbol('s');
    const obj = { a: 42, [sym]: 'test' };
    expect(stringify(obj)).toBe('[Object] {\n  a: 42,\n  Symbol(s): "test"\n}');
  });

  it('handles nested structures and indentation', () => {
    const complex = { x: [1, { y: new Set([3]) }] };
    expect(stringify(complex)).toBe(
      [
        '[Object] {',
        '  x: [Array(2)] [',
        '    1,',
        '    [Object] {',
        '      y: [Set(1)] {',
        '        3',
        '      }',
        '    }',
        '  ]',
        '}',
      ].join('\n'),
    );
  });

  it.skip('handles circular references', () => {
    const obj: { self?: unknown } = {};
    obj.self = obj;
    expect(() => stringify(obj)).not.toThrow();
  });
});
