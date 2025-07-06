import { describe, it } from '@jest/globals';
import { expectTypeOf } from 'expect-type';
import { mock } from 'node:test';
import type { IEqualityMethods } from '../../src/methods/equality';
import type { Validator } from '../../src/validator';

describe('isEqual', () => {
  it("updates 'Return'", () => {
    type IsEqual = IEqualityMethods<unknown, never>['isEqual'];
    const isEqual = mock.fn<IsEqual>();
    const ret = isEqual(42);
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<42>();
  });

  it("sets 'canSetError=true'", () => {
    type State = {
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type IsEqual = IEqualityMethods<unknown, State>['isEqual'];
    const isEqual = mock.fn<IsEqual>();
    const ret = isEqual(42);
    type NewState = typeof ret extends Validator<42, infer S> ? S : never;
    expectTypeOf<NewState['canSetError']>().toEqualTypeOf<true>();
  });
});

describe('notEqual', () => {
  it("updates 'Return'", () => {
    type NotEqual = IEqualityMethods<1 | 2 | 3, never>['notEqual'];
    const notEqual = mock.fn<NotEqual>();
    const ret = notEqual(3);
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<1 | 2>();
  });

  it("sets 'canSetError=true'", () => {
    type State = {
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type NotEqual = IEqualityMethods<1 | 2 | 3, State>['notEqual'];
    const notEqual = mock.fn<NotEqual>();
    const ret = notEqual(3);
    type NewState = typeof ret extends Validator<1 | 2, infer S> ? S : never;
    expectTypeOf<NewState['canSetError']>().toEqualTypeOf<true>();
  });
});

describe('isIn', () => {
  it("updates 'Return'", () => {
    type IsIn = IEqualityMethods<unknown, never>['isIn'];
    const isIn = mock.fn<IsIn>();
    const ret = isIn([1, 2, 3]);
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<1 | 2 | 3>();
  });

  it("sets 'canSetError=true'", () => {
    type State = {
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type IsIn = IEqualityMethods<unknown, State>['isIn'];
    const isIn = mock.fn<IsIn>();
    const ret = isIn([1, 2, 3]);
    type NewState =
      typeof ret extends Validator<1 | 2 | 3, infer S> ? S : never;
    expectTypeOf<NewState['canSetError']>().toEqualTypeOf<true>();
  });
});

describe('notIn', () => {
  it("updates 'Return'", () => {
    type NotIn = IEqualityMethods<unknown, never>['notIn'];
    const notIn = mock.fn<NotIn>();
    const ret = notIn([null, undefined]);
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<{}>();
  });

  it("sets 'canSetError=true'", () => {
    type State = {
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type NotIn = IEqualityMethods<unknown, State>['notIn'];
    const notIn = mock.fn<NotIn>();
    const ret = notIn([null, undefined]);
    type NewState = typeof ret extends Validator<{}, infer S> ? S : never;
    expectTypeOf<NewState['canSetError']>().toEqualTypeOf<true>();
  });
});
