import isArrayLike from './is-array-like';
import safeAccess from './safe-access';

// TODO: handle circular references

/**
 * @returns A `string` representation of the `value`.
 *
 * @internal
 */
export default function stringify(value: unknown, depth: number = 0): string {
  if (
    value == null
    || typeof value === 'boolean'
    || typeof value === 'number'
    || typeof value === 'symbol'
    || value instanceof Boolean
    || value instanceof Number
    || value instanceof RegExp
  ) {
    return String(value);
  }

  if (typeof value === 'string' || value instanceof String) return `"${value}"`;
  if (typeof value === 'bigint') return `${value}n`;
  if (typeof value === 'function') return formatFunction(value);
  if (value instanceof Date) return value.toISOString();
  if (value instanceof DataView) return formatDataView(value, depth);
  if (value instanceof ArrayBuffer) return formatBuffer(value, depth);
  if (isArrayLike(value)) return formatArray(value, depth);
  if (value instanceof Set) return formatSet(value, depth);
  if (value instanceof Map) return formatMap(value, depth);
  if (value instanceof WeakSet || value instanceof WeakMap) {
    return formatWeak(value);
  }
  if (value instanceof Error) return formatError(value, depth);
  return formatObject(value, depth);
}

/** @internal */
function formatFunction(fn: Function) {
  return fn.name ? `[Function: ${fn.name}]` : '[Function (anonymous)]';
}

/** @internal */
function formatDataView(dv: DataView, depth: number) {
  const head = `[${dv.constructor.name}(${dv.byteLength})]`;
  const items = formatArrayItems(Array.from(new Uint8Array(dv.buffer)), depth);
  return `${head} ${items}`;
}

/** @internal */
function formatBuffer(buf: ArrayBuffer, depth: number) {
  const head = `[${buf.constructor.name}(${buf.byteLength})]`;
  const items = formatArrayItems(Array.from(new Uint8Array(buf)), depth);
  return `${head} ${items}`;
}

/** @internal */
function formatArray(arr: ArrayLike<unknown>, depth: number) {
  const head = `[${arr.constructor.name}(${arr.length})]`;
  const items = formatArrayItems(Array.from(arr), depth);
  return `${head} ${items}`;
}

/** @internal */
function formatArrayItems(arr: unknown[], depth: number) {
  const items = arr.map((i) => stringify(i, depth + 1));
  return enclose('square', items, depth);
}

/** @internal */
function formatSet(set: Set<unknown>, depth: number) {
  const head = `[${set.constructor.name}(${set.size})]`;
  const items = formatSetItems(set, depth);
  return `${head} ${items}`;
}

/** @internal */
function formatSetItems(set: Set<unknown>, depth: number) {
  const items = Array.from(set).map((i) => stringify(i, depth + 1));
  return enclose('curly', items, depth);
}

/** @internal */
function formatMap(map: Map<unknown, unknown>, depth: number) {
  const head = `[${map.constructor.name}(${map.size})]`;
  const items = formatMapItems(map, depth);
  return `${head} ${items}`;
}

/** @internal */
function formatMapItems(map: Map<unknown, unknown>, depth: number) {
  const items = Array.from(map).map(
    ([k, v]) => `${stringify(k, depth + 1)}: ${stringify(v, depth + 1)}`,
  );
  return enclose('curly', items, depth);
}

/** @internal */
function formatWeak(weak: WeakSet<object> | WeakMap<object, unknown>) {
  return `[${weak.constructor.name} (items unknown)]`;
}

/** @internal */
function formatError(err: Error, depth: number) {
  let head = `[${err.constructor.name}`;
  head += err.message ? `: ${err.message}]` : ']';
  const items = formatProperties(err, depth);
  return `${head}${items === '{}' ? '' : ` ${items}`}`;
}

/** @internal */
function formatObject(obj: object, depth: number) {
  const head = `[${obj.constructor.name}]`;
  const items = formatProperties(obj, depth);
  return `${head} ${items}`;
}

/** @internal */
function formatProperties(obj: object, depth: number) {
  let keys = getSortedKeys(obj);
  if (obj instanceof Error) {
    keys = keys.filter((k) => k !== 'message' && k !== 'stack');
  }

  const getterFallback = '[Getter (failed)]';
  const items = keys.map((k) => {
    const v = safeAccess(obj, k, getterFallback);
    return `${String(k)}: ${v === getterFallback ? v : stringify(v, depth + 1)}`;
  });

  return enclose('curly', items, depth);
}

/** @internal */
function getSortedKeys(obj: object) {
  const propNames = Object.getOwnPropertyNames(obj);
  const propSymbols = Object.getOwnPropertySymbols(obj);
  propNames.sort();
  propSymbols.sort((a, b) => String(a).localeCompare(String(b)));
  return [...propNames, ...propSymbols];
}

/** @internal */
function enclose(brace: 'curly' | 'square', items: string[], depth: number) {
  const [open, close] = brace === 'curly' ? ['{', '}'] : ['[', ']'];
  if (items.length === 0) return `${open}${close}`;
  const list = items.map((i) => indent(i, depth + 1)).join(',\n');
  return `${open}\n${list}\n${indent(close, depth)}`;
}

/** @internal */
function indent(item: string, depth: number) {
  return `${'  '.repeat(depth)}${item}`;
}
