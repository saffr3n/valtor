import { describe, it } from '@jest/globals';
import { expectTypeOf } from 'expect-type';
import { mock } from 'node:test';
import type {
  INullableMethods,
  NullableMethods,
  RequiredReturn,
} from '../../src/methods/nullable';
import type { Validator } from '../../src/validator';

describe('setFallback', () => {
  it("updates 'Return'", () => {
    type SetFallback = INullableMethods<42 | null, never>['setFallback'];
    const setFallback = mock.fn<SetFallback>();
    const ret = setFallback(42);
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<42>();
  });

  it("sets 'canSetError=false', 'canSetFallback=false', 'isNullableApplied=true'", () => {
    type State = {
      canSetError: true;
      canSetFallback: true;
      isNullableApplied: false;
    };
    type SetFallback = INullableMethods<42 | null, State>['setFallback'];
    const setFallback = mock.fn<SetFallback>();
    const ret = setFallback(42);
    type NewState = typeof ret extends Validator<42, infer S> ? S : never;
    expectTypeOf<NewState>().toEqualTypeOf<{
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: true;
    }>();
  });

  it("only available if 'canSetFallback=true'", () => {
    type BaseState = { canSetError: false; isNullableApplied: false };
    type NoSetFallback = NullableMethods<
      unknown,
      BaseState & { canSetFallback: false }
    >;
    type HasSetFallback = NullableMethods<
      unknown,
      BaseState & { canSetFallback: true }
    >;
    expectTypeOf<NoSetFallback>().not.toHaveProperty('setFallback');
    expectTypeOf<HasSetFallback>().toHaveProperty('setFallback');
  });
});

describe('isRequired', () => {
  it("updates 'Return'", () => {
    type IsRequired = INullableMethods<42 | null, never>['isRequired'];
    const isRequired = mock.fn<IsRequired>();
    const ret = isRequired();
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<42>();
  });

  it("sets 'canSetError=true', 'isNullableApplied=true'", () => {
    type State = {
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type IsRequired = INullableMethods<42 | null, State>['isRequired'];
    const isRequired = mock.fn<IsRequired>();
    const ret = isRequired();
    type NewState = typeof ret extends Validator<42, infer S> ? S : never;
    expectTypeOf<NewState>().toEqualTypeOf<{
      canSetError: true;
      canSetFallback: false;
      isNullableApplied: true;
    }>();
  });

  it("only available if 'isNullableApplied=false' and 'Return' is union containing 'null' and/or 'undefined'", () => {
    type BaseState = { canSetError: false; canSetFallback: false };
    type NoIsRequired1 = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: true }
    >;
    type NoIsRequired2 = NullableMethods<
      42,
      BaseState & { isNullableApplied: false }
    >;
    type HasIsRequired = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: false }
    >;
    expectTypeOf<NoIsRequired1>().not.toHaveProperty('isRequired');
    expectTypeOf<NoIsRequired2>().not.toHaveProperty('isRequired');
    expectTypeOf<HasIsRequired>().toHaveProperty('isRequired');
  });
});

describe('notRequired', () => {
  it("doesn't update 'Return'", () => {
    type NotRequired = INullableMethods<42 | null, never>['notRequired'];
    const notRequired = mock.fn<NotRequired>();
    const ret = notRequired();
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<42 | null>();
  });

  it("sets 'canSetError=false', 'isNullableApplied=true'", () => {
    type State = {
      canSetError: true;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type NotRequired = INullableMethods<42 | null, State>['notRequired'];
    const notRequired = mock.fn<NotRequired>();
    const ret = notRequired();
    type NewState =
      typeof ret extends Validator<42 | null, infer S> ? S : never;
    expectTypeOf<NewState>().toEqualTypeOf<{
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: true;
    }>();
  });

  it("only available if 'isNullableApplied=false' and 'Return' is union containing 'null' and/or 'undefined'", () => {
    type BaseState = { canSetError: false; canSetFallback: false };
    type NoNotRequired1 = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: true }
    >;
    type NoNotRequired2 = NullableMethods<
      42,
      BaseState & { isNullableApplied: false }
    >;
    type HasNotRequired = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: false }
    >;
    expectTypeOf<NoNotRequired1>().not.toHaveProperty('notRequired');
    expectTypeOf<NoNotRequired2>().not.toHaveProperty('notRequired');
    expectTypeOf<HasNotRequired>().toHaveProperty('notRequired');
  });
});

describe('isMissing', () => {
  it("updates 'Return'", () => {
    type IsMissing = INullableMethods<42 | null, never>['isMissing'];
    const isMissing = mock.fn<IsMissing>();
    const ret = isMissing();
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<null>();
  });

  it("sets 'canSetError=true', 'canSetFallback=false', 'isNullableApplied=true'", () => {
    type State = {
      canSetError: false;
      canSetFallback: true;
      isNullableApplied: false;
    };
    type IsMissing = INullableMethods<42 | null, State>['isMissing'];
    const isMissing = mock.fn<IsMissing>();
    const ret = isMissing();
    type NewState = typeof ret extends Validator<null, infer S> ? S : never;
    expectTypeOf<NewState>().toEqualTypeOf<{
      canSetError: true;
      canSetFallback: false;
      isNullableApplied: true;
    }>();
  });

  it("only available if 'isNullableApplied=false' and 'Return' is union containing 'null' and/or 'undefined'", () => {
    type BaseState = { canSetError: false; canSetFallback: false };
    type NoIsMissing1 = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: true }
    >;
    type NoIsMissing2 = NullableMethods<
      42,
      BaseState & { isNullableApplied: false }
    >;
    type HasIsMissing = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: false }
    >;
    expectTypeOf<NoIsMissing1>().not.toHaveProperty('isMissing');
    expectTypeOf<NoIsMissing2>().not.toHaveProperty('isMissing');
    expectTypeOf<HasIsMissing>().toHaveProperty('isMissing');
  });
});

describe('notMissing', () => {
  it("updates 'Return'", () => {
    type NotMissing = INullableMethods<42 | null, never>['notMissing'];
    const notMissing = mock.fn<NotMissing>();
    const ret = notMissing();
    type NewReturn = typeof ret extends Validator<infer R, never> ? R : never;
    expectTypeOf<NewReturn>().toEqualTypeOf<42>();
  });

  it("sets 'canSetError=true', 'isNullableApplied=true'", () => {
    type State = {
      canSetError: false;
      canSetFallback: false;
      isNullableApplied: false;
    };
    type NotMissing = INullableMethods<42 | null, State>['notMissing'];
    const notMissing = mock.fn<NotMissing>();
    const ret = notMissing();
    type NewState = typeof ret extends Validator<42, infer S> ? S : never;
    expectTypeOf<NewState>().toEqualTypeOf<{
      canSetError: true;
      canSetFallback: false;
      isNullableApplied: true;
    }>();
  });

  it("only available if 'isNullableApplied=false' and 'Return' is union containing 'null' and/or 'undefined'", () => {
    type BaseState = { canSetError: false; canSetFallback: false };
    type NoNotMissing1 = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: true }
    >;
    type NoNotMissing2 = NullableMethods<
      42,
      BaseState & { isNullableApplied: false }
    >;
    type HasNotMissing = NullableMethods<
      42 | null,
      BaseState & { isNullableApplied: false }
    >;
    expectTypeOf<NoNotMissing1>().not.toHaveProperty('notMissing');
    expectTypeOf<NoNotMissing2>().not.toHaveProperty('notMissing');
    expectTypeOf<HasNotMissing>().toHaveProperty('notMissing');
  });
});

describe('RequiredReturn', () => {
  it("removes both 'null' and 'undefined' from 'Return' with 'Options.allowNull=false'", () => {
    expectTypeOf<
      RequiredReturn<unknown, { allowNull: false }>
    >().toEqualTypeOf<{}>();
  });

  it("only removes 'undefined' from 'Return' with 'Options.allowNull=true'", () => {
    expectTypeOf<
      RequiredReturn<unknown, { allowNull: true }>
    >().toEqualTypeOf<{} | null>();
  });
});
