import { describe, it } from '@jest/globals';
import { expectTypeOf } from 'expect-type';
import { mock } from 'node:test';
import type { BaseMethods, IBaseMethods } from '../../src/methods/base';
import type { Validator } from '../../src/validator';

describe('get', () => {
  it("returns 'Promise<Return>'", () => {
    type Get = IBaseMethods<42, never>['get'];
    const get = mock.fn<Get>();
    const ret = get();
    expectTypeOf(ret).toEqualTypeOf<Promise<42>>();
  });
});

describe('custom', () => {
  it("updates 'Return' with its callback", () => {
    type Custom = IBaseMethods<unknown, never>['custom'];
    const custom = mock.fn<Custom>();
    const ret = custom(() => 42);
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<number>();
  });

  it("sets 'canSetError=false'", () => {
    type State = {
      canSetError: true;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type Custom = IBaseMethods<unknown, State>['custom'];
    const custom = mock.fn<Custom>();
    const ret = custom(() => 42);
    type NewState = typeof ret extends Validator<number, infer S> ? S : never;
    expectTypeOf<NewState['canSetError']>().toEqualTypeOf<false>();
  });

  it("sets 'canSetFallback=false' on radical 'Return' transformations", () => {
    type State = {
      canSetError: false;
      canSetFallback: true;
      isNullableApplied: false;
    };
    type Custom = IBaseMethods<string, State>['custom'];
    const custom = mock.fn<Custom>();
    const ret = custom(() => 42);
    type NewState = typeof ret extends Validator<number, infer S> ? S : never;
    expectTypeOf<NewState['canSetFallback']>().toEqualTypeOf<false>();
  });
});

describe('withError', () => {
  it("sets 'canSetError=false'", () => {
    type State = {
      canSetError: true;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type WithError = IBaseMethods<unknown, State>['withError'];
    const withError = mock.fn<WithError>();
    const ret = withError('test');
    type NewState = typeof ret extends Validator<unknown, infer S> ? S : never;
    expectTypeOf<NewState['canSetError']>().toEqualTypeOf<false>();
  });

  it("only available if 'canSetError=true'", () => {
    type BaseState = { canSetFallback: false; isNullableApplied: false };
    type NoWithError = BaseMethods<unknown, BaseState & { canSetError: false }>;
    type HasWithError = BaseMethods<unknown, BaseState & { canSetError: true }>;
    expectTypeOf<NoWithError>().not.toHaveProperty('withError');
    expectTypeOf<HasWithError>().toHaveProperty('withError');
  });
});
