/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it } from '@jest/globals';
import { expectTypeOf } from 'expect-type';
import type {
  Defined,
  Exclude,
  Extract,
  IsPossibly,
  IsUnknown,
  NonNullable,
  Override,
} from '../../src/utils/types';

describe('IsUnknown', () => {
  it("returns 'true' for 'any' and 'unknown'", () => {
    expectTypeOf<IsUnknown<any>>().toEqualTypeOf<true>();
    expectTypeOf<IsUnknown<unknown>>().toEqualTypeOf<true>();
  });

  it("returns 'true' for '{} | null | undefined'", () => {
    expectTypeOf<IsUnknown<{} | null | undefined>>().toEqualTypeOf<true>();
  });

  it("returns 'false' for everything else", () => {
    expectTypeOf<IsUnknown<null>>().toEqualTypeOf<false>();
    expectTypeOf<IsUnknown<undefined>>().toEqualTypeOf<false>();
    expectTypeOf<IsUnknown<null | undefined>>().toEqualTypeOf<false>();
    expectTypeOf<IsUnknown<{}>>().toEqualTypeOf<false>();
    expectTypeOf<IsUnknown<{} | null>>().toEqualTypeOf<false>();
    expectTypeOf<IsUnknown<{} | undefined>>().toEqualTypeOf<false>();
    expectTypeOf<IsUnknown<[]>>().toEqualTypeOf<false>();
    expectTypeOf<IsUnknown<''>>().toEqualTypeOf<false>();
  });
});

describe('Extract', () => {
  it("extracts from broad types, such as 'any', 'unknown' and '{}'", () => {
    expectTypeOf<Extract<any, 42>>().toEqualTypeOf<42>();
    expectTypeOf<Extract<unknown, 42>>().toEqualTypeOf<42>();
    expectTypeOf<Extract<{}, 42>>().toEqualTypeOf<42>();
    expectTypeOf<Extract<any, null>>().toEqualTypeOf<null>();
    expectTypeOf<Extract<any, undefined>>().toEqualTypeOf<undefined>();
    expectTypeOf<Extract<unknown, null>>().toEqualTypeOf<null>();
    expectTypeOf<Extract<unknown, undefined>>().toEqualTypeOf<undefined>();
  });

  it("doesn't extract 'null' and 'undefined' from '{}'", () => {
    expectTypeOf<Extract<{}, null>>().toEqualTypeOf<never>();
    expectTypeOf<Extract<{}, undefined>>().toEqualTypeOf<never>();
  });

  it("works as builtin 'Extract' for everything else", () => {
    expectTypeOf<Extract<'a' | 'b', 'a'>>().toEqualTypeOf<'a'>();
    expectTypeOf<Extract<'a' | 'b', 'c'>>().toEqualTypeOf<never>();
  });
});

describe('Exclude', () => {
  it("excludes 'null', 'undefined' and '{}' from 'any' and 'unknown'", () => {
    expectTypeOf<Exclude<any, null>>().toEqualTypeOf<{} | undefined>();
    expectTypeOf<Exclude<any, undefined>>().toEqualTypeOf<{} | null>();
    expectTypeOf<Exclude<any, null | undefined>>().toEqualTypeOf<{}>();
    expectTypeOf<Exclude<any, {}>>().toEqualTypeOf<null | undefined>();
    expectTypeOf<Exclude<unknown, null>>().toEqualTypeOf<{} | undefined>();
    expectTypeOf<Exclude<unknown, undefined>>().toEqualTypeOf<{} | null>();
    expectTypeOf<Exclude<unknown, null | undefined>>().toEqualTypeOf<{}>();
    expectTypeOf<Exclude<unknown, {}>>().toEqualTypeOf<null | undefined>();
  });

  it("works as builtin 'Exclude' for everything else", () => {
    expectTypeOf<Exclude<any, any>>().toEqualTypeOf<never>();
    expectTypeOf<Exclude<unknown, unknown>>().toEqualTypeOf<never>();
    expectTypeOf<Exclude<any, unknown>>().toEqualTypeOf<never>();
    expectTypeOf<Exclude<unknown, any>>().toEqualTypeOf<never>();
    expectTypeOf<Exclude<42, 42>>().toEqualTypeOf<never>();
    expectTypeOf<Exclude<'a' | 'b', 'a'>>().toEqualTypeOf<'b'>();
    expectTypeOf<Exclude<'a' | 'b', 'c'>>().toEqualTypeOf<'a' | 'b'>();
  });
});

describe('Defined', () => {
  it("excludes 'undefined' from union types", () => {
    expectTypeOf<Defined<42 | undefined>>().toEqualTypeOf<42>();
    expectTypeOf<Defined<undefined>>().toEqualTypeOf<never>();
  });

  it("excludes 'undefined' from 'any' and 'unknown'", () => {
    expectTypeOf<Defined<any>>().toEqualTypeOf<{} | null>();
    expectTypeOf<Defined<unknown>>().toEqualTypeOf<{} | null>();
  });

  it("doesn't exclude 'null'", () => {
    expectTypeOf<Defined<42 | null>>().toEqualTypeOf<42 | null>();
  });
});

describe('NonNullable', () => {
  it("excludes 'null' and 'undefined' from union types", () => {
    expectTypeOf<NonNullable<42 | null>>().toEqualTypeOf<42>();
    expectTypeOf<NonNullable<42 | undefined>>().toEqualTypeOf<42>();
    expectTypeOf<NonNullable<42 | null | undefined>>().toEqualTypeOf<42>();
    expectTypeOf<NonNullable<null | undefined>>().toEqualTypeOf<never>();
  });

  it("excludes 'null' and 'undefined' from 'any' and 'unknown'", () => {
    expectTypeOf<NonNullable<any>>().toEqualTypeOf<{}>();
    expectTypeOf<NonNullable<unknown>>().toEqualTypeOf<{}>();
  });
});

describe('IsPossibly', () => {
  it("returns 'true' if 'U' is 'any' or 'unknown' regardless of 'T'", () => {
    expectTypeOf<IsPossibly<42, any>>().toEqualTypeOf<true>();
    expectTypeOf<IsPossibly<42, unknown>>().toEqualTypeOf<true>();
  });

  it("returns 'true' if 'U' is '{}' and 'T' is not 'null' or 'undefined'", () => {
    expectTypeOf<IsPossibly<42, {}>>().toEqualTypeOf<true>();
    expectTypeOf<IsPossibly<42 | null, {}>>().toEqualTypeOf<true>();
    expectTypeOf<IsPossibly<42 | undefined, {}>>().toEqualTypeOf<true>();
    expectTypeOf<IsPossibly<42 | null | undefined, {}>>().toEqualTypeOf<true>();
    expectTypeOf<IsPossibly<null, {}>>().toEqualTypeOf<false>();
    expectTypeOf<IsPossibly<undefined, {}>>().toEqualTypeOf<false>();
    expectTypeOf<IsPossibly<null | undefined, {}>>().toEqualTypeOf<false>();
  });

  it("returns 'true' if 'U' is union containing 'T'", () => {
    expectTypeOf<IsPossibly<'a', 'a' | 'b'>>().toEqualTypeOf<true>();
  });

  it("returns 'false' if 'U' doesn't contain 'T'", () => {
    expectTypeOf<IsPossibly<'a', 'b'>>().toEqualTypeOf<false>();
  });

  it("returns 'false' if 'U' is same with 'T'", () => {
    expectTypeOf<IsPossibly<'a', 'a'>>().toEqualTypeOf<false>();
  });
});

describe('Override', () => {
  it('overrides type of existing property', () => {
    type Base = { a: string; b: number };
    type Over = { b: string };
    type Expected = { a: string; b: string };
    expectTypeOf<Override<Base, Over>>().toEqualTypeOf<Expected>();
  });

  it("doesn't work with non-existing properties", () => {
    type Base = { a: string; b: number };
    type Over = { b: string; c: string };
    type Expected = never;
    expectTypeOf<Override<Base, Over>>().toEqualTypeOf<Expected>();
  });
});
