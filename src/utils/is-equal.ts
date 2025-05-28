import isArrayLike from './is-array-like';
import safeAccess from './safe-access';
import type { EqualityOptions } from '../methods/equality';

// TODO: handle circular references

/** @internal */
export default function isEqual(
  a: unknown,
  b: unknown,
  opts: EqualityOptions = {},
) {
  if (Object.is(a, b)) return true;
  if (
    !opts.deep
    || typeof a !== 'object'
    || a === null
    || typeof b !== 'object'
    || b === null
    || a instanceof WeakSet
    || b instanceof WeakSet
    || a instanceof WeakMap
    || b instanceof WeakMap
  ) {
    return false;
  }
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;

  let res: boolean | undefined;
  if ((res = tryCompareBoxed(Boolean, a, b)) !== undefined) return res;
  if ((res = tryCompareBoxed(Number, a, b)) !== undefined) return res;
  if ((res = tryCompareBoxed(String, a, b)) !== undefined) return res;
  if ((res = tryCompareRegex(a, b)) !== undefined) return res;
  if ((res = tryCompareDate(a, b)) !== undefined) return res;
  if ((res = tryCompareDataView(a, b)) !== undefined) return res;
  if ((res = tryCompareArrayBuffer(a, b)) !== undefined) return res;
  if ((res = tryCompareArrayLike(a, b, opts)) !== undefined) return res;
  if ((res = tryCompareSet(a, b, opts)) !== undefined) return res;
  if ((res = tryCompareMap(a, b, opts)) !== undefined) return res;
  if ((res = tryCompareObject(a, b, opts)) !== undefined) return res;

  return true;
}

/** @internal */
function tryCompareBoxed(
  ctor: BooleanConstructor | NumberConstructor | StringConstructor,
  a: object,
  b: object,
) {
  const isBoxedA = a instanceof ctor;
  const isBoxedB = b instanceof ctor;
  if (isBoxedA !== isBoxedB) return false;
  if (!isBoxedA || !isBoxedB) return undefined;
  return ctor(a) === ctor(b);
}

/** @internal */
function tryCompareRegex(a: object, b: object) {
  const isRegexA = a instanceof RegExp;
  const isRegexB = b instanceof RegExp;
  if (isRegexA !== isRegexB) return false;
  if (!isRegexA || !isRegexB) return undefined;
  return String(a) === String(b);
}

/** @internal */
function tryCompareDate(a: object, b: object) {
  const isDateA = a instanceof Date;
  const isDateB = b instanceof Date;
  if (isDateA !== isDateB) return false;
  if (!isDateA || !isDateB) return undefined;
  return a.getTime() === b.getTime();
}

/** @internal */
function tryCompareDataView(a: object, b: object) {
  const isDataViewA = a instanceof DataView;
  const isDataViewB = b instanceof DataView;
  if (isDataViewA !== isDataViewB) return false;
  if (!isDataViewA || !isDataViewB) return undefined;
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a.getUint8(i) !== b.getUint8(i)) return false;
  }
  return true;
}

/** @internal */
function tryCompareArrayBuffer(a: object, b: object) {
  const isArrBufA = a instanceof ArrayBuffer;
  const isArrBufB = b instanceof ArrayBuffer;
  if (isArrBufA !== isArrBufB) return false;
  if (!isArrBufA || !isArrBufB) return undefined;
  const bufA = new Uint8Array(a);
  const bufB = new Uint8Array(b);
  if (bufA.length !== bufB.length) return false;
  for (let i = 0; i < bufA.length; i++) {
    if (bufA[i] !== bufB[i]) return false;
  }
  return true;
}

/** @internal */
function tryCompareArrayLike(a: object, b: object, opts: EqualityOptions) {
  const isArrA = isArrayLike(a);
  const isArrB = isArrayLike(b);
  if (isArrA !== isArrB) return false;
  if (!isArrA || !isArrB) return undefined;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!isEqual(a[i], b[i], opts)) return false;
  }
  return true;
}

/** @internal */
function tryCompareSet(a: object, b: object, opts: EqualityOptions) {
  const isSetA = a instanceof Set;
  const isSetB = b instanceof Set;
  if (isSetA !== isSetB) return false;
  if (!isSetA || !isSetB) return undefined;
  if (a.size !== b.size) return false;

  const objValsA: object[] = [];
  for (const v of a) {
    if (typeof v === 'object' && v !== null) objValsA.push(v);
    else if (!b.has(v)) return false;
  }
  if (objValsA.length === 0) return true;

  const objValsB: object[] = Array.from(b).filter(
    (v) => typeof v === 'object' && v !== null,
  );

  for (const vA of objValsA) {
    let found = -1;
    for (let i = 0; i < objValsB.length; i++) {
      const vB = objValsB[i];
      if (isEqual(vA, vB, opts)) {
        found = i;
        break;
      }
    }
    if (found < 0) return false;

    const last = objValsB.length - 1;
    [objValsB[found], objValsB[last]] = [objValsB[last], objValsB[found]];
    objValsB.pop();
  }

  return true;
}

/** @internal */
function tryCompareMap(a: object, b: object, opts: EqualityOptions) {
  const isMapA = a instanceof Map;
  const isMapB = b instanceof Map;
  if (isMapA !== isMapB) return false;
  if (!isMapA || !isMapB) return undefined;
  if (a.size !== b.size) return false;

  const objItemsA: [object, unknown][] = [];
  for (const [k, v] of a) {
    if (typeof k === 'object' && k !== null) objItemsA.push([k, v]);
    else {
      if (!b.has(k)) return false;
      if (!isEqual(v, b.get(k), opts)) return false;
    }
  }
  if (objItemsA.length === 0) return true;

  const objItemsB: [object, unknown][] = Array.from(b).filter(
    ([k]) => typeof k === 'object' && k !== null,
  );

  for (const [kA, vA] of objItemsA) {
    let found = -1;
    for (let i = 0; i < objItemsB.length; i++) {
      const [kB, vB] = objItemsB[i];
      if (isEqual(kA, kB, opts) && isEqual(vA, vB, opts)) {
        found = i;
        break;
      }
    }
    if (found < 0) return false;

    const last = objItemsB.length - 1;
    [objItemsB[found], objItemsB[last]] = [objItemsB[last], objItemsB[found]];
    objItemsB.pop();
  }

  return true;
}

/** @internal */
function tryCompareObject(a: object, b: object, opts: EqualityOptions) {
  let keys = Reflect.ownKeys(a);
  if (keys.length !== Reflect.ownKeys(b).length) return false;

  const isErrA = a instanceof Error;
  const isErrB = b instanceof Error;
  if (isErrA !== isErrB) return false;
  if (isErrA && isErrB) {
    if (a.name !== b.name || a.message !== b.message) return false;
    keys = keys.filter((k) => k !== 'stack');
  }

  for (const key of keys) {
    if (!isEqual(safeAccess(a, key), safeAccess(b, key), opts)) return false;
  }

  return undefined;
}
