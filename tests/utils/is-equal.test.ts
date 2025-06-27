import { describe, it, expect } from '@jest/globals';
import isEqual from '../../src/utils/is-equal';

describe('isEqual', () => {
  it("returns 'true' for identical primitives", () => {
    expect(isEqual(42, 42)).toBe(true);
    expect(isEqual('a', 'a')).toBe(true);
    expect(isEqual(true, true)).toBe(true);
  });

  it("returns 'false' for different primitives", () => {
    expect(isEqual(1, 2)).toBe(false);
    expect(isEqual('a', 'b')).toBe(false);
    expect(isEqual(true, false)).toBe(false);
  });

  it("handles 'deep=false' option correctly", () => {
    expect(isEqual({ a: 42 }, { a: 42 }, { deep: false })).toBe(false);
  });

  it("returns 'false' for mismatched prototypes", () => {
    class A {
      x = 42;
    }
    class B {
      x = 42;
    }
    expect(isEqual(new A(), new B(), { deep: true })).toBe(false);
  });

  it('compares boxed values', () => {
    expect(isEqual(new Number(42), Object(42), { deep: true })).toBe(true);
    expect(isEqual(new Number(1), new Number(2), { deep: true })).toBe(false);
  });

  it("compares 'RegExp'", () => {
    expect(isEqual(/a/i, /a/i, { deep: true })).toBe(true);
    expect(isEqual(/a/i, /a/, { deep: true })).toBe(false);
    expect(isEqual(/a/, /b/, { deep: true })).toBe(false);
  });

  it("compares 'Date'", () => {
    expect(isEqual(new Date(1000), new Date(1000), { deep: true })).toBe(true);
    expect(isEqual(new Date(1000), new Date(2000), { deep: true })).toBe(false);
  });

  it('compares typed arrays', () => {
    const arr1 = new Uint8Array([1, 2, 3]);
    const arr2 = new Uint8Array([1, 2, 3]);
    const arr3 = new Uint8Array([1, 2, 4]);
    expect(isEqual(arr1, arr2, { deep: true })).toBe(true);
    expect(isEqual(arr1, arr3, { deep: true })).toBe(false);
  });

  it("compares 'ArrayBuffer' and 'DataView'", () => {
    const buf1 = new Uint8Array([1, 2, 3]).buffer;
    const buf2 = new Uint8Array([1, 2, 3]).buffer;
    const buf3 = new Uint8Array([1, 2, 4]).buffer;
    expect(isEqual(buf1, buf2, { deep: true })).toBe(true);
    expect(isEqual(buf1, buf3, { deep: true })).toBe(false);
    const dv1 = new DataView(buf1);
    const dv2 = new DataView(buf2);
    const dv3 = new DataView(buf3);
    expect(isEqual(dv1, dv2, { deep: true })).toBe(true);
    expect(isEqual(dv1, dv3, { deep: true })).toBe(false);
  });

  it('compares array-like structures', () => {
    const arr = [1, 2, 3];
    const nodeList = {
      length: 3,
      0: 1,
      1: 2,
      2: 3,
      [Symbol.iterator]: Array.prototype[Symbol.iterator],
    };
    Object.setPrototypeOf(nodeList, Array.prototype);
    expect(isEqual(arr, [1, 2, 3], { deep: true })).toBe(true);
    expect(isEqual(arr, [1, 2], { deep: true })).toBe(false);
    expect(isEqual(nodeList, [1, 2, 3], { deep: true })).toBe(true);
  });

  it("skips 'WeakMap' and 'WeakSet'", () => {
    expect(isEqual(new WeakMap(), new WeakMap(), { deep: true })).toBe(false);
    expect(isEqual(new WeakSet(), new WeakSet(), { deep: true })).toBe(false);
  });

  it("compares 'Set'", () => {
    const s1 = new Set([1, 2, 3]);
    const s2 = new Set([3, 2, 1]);
    const s3 = new Set([1, 2, 4]);
    expect(isEqual(s1, s2, { deep: true })).toBe(true);
    expect(isEqual(s1, s3, { deep: true })).toBe(false);
  });

  it("compares 'Map'", () => {
    const m1 = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    const m2 = new Map([
      ['b', 2],
      ['a', 1],
    ]);
    const m3 = new Map([
      ['a', 1],
      ['b', 3],
    ]);
    expect(isEqual(m1, m2, { deep: true })).toBe(true);
    expect(isEqual(m1, m3, { deep: true })).toBe(false);
  });

  it('compares plain objects', () => {
    const o1 = { a: 1, b: { c: 2 } };
    const o2 = { a: 1, b: { c: 2 } };
    const o3 = { a: 1, b: { c: 3 } };
    expect(isEqual(o1, o2, { deep: true })).toBe(true);
    expect(isEqual(o1, o3, { deep: true })).toBe(false);
  });

  it('compares error objects', () => {
    const err1 = new Error('msg');
    const err2 = new Error('msg');
    const err3 = new Error('other');
    expect(isEqual(err1, err2, { deep: true })).toBe(true);
    expect(isEqual(err1, err3, { deep: true })).toBe(false);
  });

  it.skip('handles circular references (TODO)', () => {
    const a: { self?: unknown } = {};
    a.self = a;
    const b: { self?: unknown } = {};
    b.self = b;
    expect(() => isEqual(a, b, { deep: true })).not.toThrow();
  });
});
