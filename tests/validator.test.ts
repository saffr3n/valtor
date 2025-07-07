import { describe, it, expect } from '@jest/globals';
import { expectTypeOf } from 'expect-type';
import ValidatorImpl, { type Validator } from '../src/validator';
import ValidationError from '../src/utils/validation-error';

describe('Validator', () => {
  it("has correct initial 'State'", () => {
    type State<Return> =
      Validator<Return> extends Validator<Return, infer S> ? S : never;
    expectTypeOf<State<42 | null>>().toEqualTypeOf<{
      isNullableApplied: false;
      canSetError: false;
      canSetFallback: true;
    }>();
    expectTypeOf<State<42>>().toEqualTypeOf<{
      isNullableApplied: false;
      canSetError: false;
      canSetFallback: false;
    }>();
  });
});

describe('ValidatorImpl', () => {
  describe('get', () => {
    it('resolves to original value when no checks applied', async () => {
      const chain = new ValidatorImpl(42);
      await expect(chain.get()).resolves.toBe(42);
    });

    it('rejects with correct error on fail', async () => {
      const globalErr = new Error('global');
      const methodErr = new Error('method');
      const chain1 = new ValidatorImpl(null).isRequired();
      const chain2 = new ValidatorImpl(null, { error: globalErr }).isRequired();
      const chain3 = new ValidatorImpl(null, { error: globalErr })
        .isRequired()
        .withError(methodErr);
      await expect(chain1.get()).rejects.toThrow(ValidationError);
      await expect(chain2.get()).rejects.toThrow(globalErr);
      await expect(chain3.get()).rejects.toThrow(methodErr);
    });
  });

  describe('custom', () => {
    it('applies synchronous callback', async () => {
      const chain = new ValidatorImpl(21).custom((v) => v * 2);
      await expect(chain.get()).resolves.toBe(42);
    });

    it('applies asynchronous callback', async () => {
      const chain = new ValidatorImpl(21).custom(async (v) => v * 2);
      await expect(chain.get()).resolves.toBe(42);
    });
  });

  describe('withError', () => {
    it('overrides error message for previous method', async () => {
      const err = new Error('test');
      const chain1 = new ValidatorImpl(null).isRequired().withError(err);
      const chain2 = new ValidatorImpl(null as unknown)
        .isRequired()
        .isEqual(42)
        .withError(err);
      await expect(chain1.get()).rejects.toThrow(err);
      await expect(chain2.get()).rejects.not.toThrow(err);
    });

    it('wraps provided error correctly', async () => {
      const chain1 = new ValidatorImpl(null).isRequired().withError('string');
      const chain2 = new ValidatorImpl(null)
        .isRequired()
        .withError(new Error('error'));
      const chain3 = new ValidatorImpl(null)
        .isRequired()
        .withError(() => 'cb to string');
      const chain4 = new ValidatorImpl(null)
        .isRequired()
        .withError(() => new Error('cb to error'));
      await expect(chain1.get()).rejects.toThrow('string');
      await expect(chain2.get()).rejects.toThrow('error');
      await expect(chain3.get()).rejects.toThrow('cb to string');
      await expect(chain4.get()).rejects.toThrow('cb to error');
    });
  });

  describe('setFallback', () => {
    it('replaces missing value', async () => {
      const chain1 = new ValidatorImpl(null as unknown).setFallback(42);
      const chain2 = new ValidatorImpl(42).setFallback(1337);
      await expect(chain1.get()).resolves.toBe(42);
      await expect(chain2.get()).resolves.toBe(42);
    });

    it("respects 'allowNull' flag", async () => {
      const chain1 = new ValidatorImpl(null as unknown).setFallback(42, {
        allowNull: true,
      });
      const chain2 = new ValidatorImpl(null as unknown).setFallback(42);
      await expect(chain1.get()).resolves.toBe(null);
      await expect(chain2.get()).resolves.toBe(42);
    });
  });

  describe('isRequired', () => {
    it('resolves when value is present', async () => {
      const chain = new ValidatorImpl(42).isRequired();
      await expect(chain.get()).resolves.toBe(42);
    });

    it('rejects when value is missing', async () => {
      const chain = new ValidatorImpl(null).isRequired();
      await expect(chain.get()).rejects.toThrow(ValidationError);
    });

    it("respects 'allowNull' flag", async () => {
      const chain1 = new ValidatorImpl(null).isRequired({ allowNull: true });
      const chain2 = new ValidatorImpl(null).isRequired();
      await expect(chain1.get()).resolves.toBe(null);
      await expect(chain2.get()).rejects.toThrow(ValidationError);
    });
  });

  describe('notRequired', () => {
    it('allows missing values', async () => {
      const chain = new ValidatorImpl(undefined).notRequired();
      await expect(chain.get()).resolves.toBe(undefined);
    });
  });

  describe('isMissing', () => {
    it('resolves when value is missing', async () => {
      const chain = new ValidatorImpl(null).isMissing();
      await expect(chain.get()).resolves.toBe(null);
    });

    it('rejects when value is present', async () => {
      const chain = new ValidatorImpl(42).isMissing();
      await expect(chain.get()).rejects.toThrow(ValidationError);
    });

    it("respects 'allowNull' flag", async () => {
      const chain1 = new ValidatorImpl(null).isMissing();
      const chain2 = new ValidatorImpl(null).isMissing({ allowNull: true });
      await expect(chain1.get()).resolves.toBe(null);
      await expect(chain2.get()).rejects.toThrow(ValidationError);
    });
  });

  describe('notMissing', () => {
    it("behaves like 'isRequired'", async () => {
      const chain1 = new ValidatorImpl(42).notMissing();
      const chain2 = new ValidatorImpl(null).notMissing();
      await expect(chain1.get()).resolves.toBe(42);
      await expect(chain2.get()).rejects.toThrow(ValidationError);
    });
  });

  describe('isEqual', () => {
    it('resolves when values equal', async () => {
      const chain = new ValidatorImpl(42).isEqual(42);
      await expect(chain.get()).resolves.toBe(42);
    });

    it('rejects when values differ', async () => {
      const chain = new ValidatorImpl('a').isEqual('b');
      await expect(chain.get()).rejects.toThrow(ValidationError);
    });

    it("respects 'deep' flag", async () => {
      const chain1 = new ValidatorImpl({ foo: 'bar' }).isEqual(
        { foo: 'bar' },
        { deep: true },
      );
      const chain2 = new ValidatorImpl({ foo: 'bar' }).isEqual({ foo: 'bar' });
      await expect(chain1.get()).resolves.toEqual({ foo: 'bar' });
      await expect(chain2.get()).rejects.toThrow(ValidationError);
    });
  });

  describe('notEqual', () => {
    it('resolves when values differ', async () => {
      const chain = new ValidatorImpl('a').notEqual('b');
      await expect(chain.get()).resolves.toBe('a');
    });

    it('rejects when values equal', async () => {
      const chain = new ValidatorImpl(42).notEqual(42);
      await expect(chain.get()).rejects.toThrow(ValidationError);
    });

    it("respects 'deep' flag", async () => {
      const chain1 = new ValidatorImpl({ foo: 'bar' }).notEqual({ foo: 'bar' });
      const chain2 = new ValidatorImpl({ foo: 'bar' }).notEqual(
        { foo: 'bar' },
        { deep: true },
      );
      await expect(chain1.get()).resolves.toEqual({ foo: 'bar' });
      await expect(chain2.get()).rejects.toThrow(ValidationError);
    });
  });

  describe('isIn', () => {
    it('resolves when value is in array', async () => {
      const chain = new ValidatorImpl(1).isIn([1, 2, 3]);
      await expect(chain.get()).resolves.toBe(1);
    });

    it('rejects when value is not in array', async () => {
      const chain = new ValidatorImpl(42).isIn([1, 2, 3]);
      await expect(chain.get()).rejects.toThrow(ValidationError);
    });

    it("respects 'deep' flag", async () => {
      const chain1 = new ValidatorImpl({ foo: 'bar' } as unknown).isIn(
        [{ foo: 'bar' }, { bar: 'foo' }],
        { deep: true },
      );
      const chain2 = new ValidatorImpl({ foo: 'bar' } as unknown).isIn([
        { foo: 'bar' },
        { bar: 'foo' },
      ]);
      await expect(chain1.get()).resolves.toEqual({ foo: 'bar' });
      await expect(chain2.get()).rejects.toThrow(ValidationError);
    });
  });

  describe('notIn', () => {
    it('resolves when value is not in array', async () => {
      const chain = new ValidatorImpl(42).notIn([1, 2, 3]);
      await expect(chain.get()).resolves.toBe(42);
    });

    it('rejects when value is in array', async () => {
      const chain = new ValidatorImpl(1).notIn([1, 2, 3]);
      await expect(chain.get()).rejects.toThrow(ValidationError);
    });

    it("respects 'deep' flag", async () => {
      const chain1 = new ValidatorImpl({ foo: 'bar' } as unknown).notIn([
        { foo: 'bar' },
        { bar: 'foo' },
      ]);
      const chain2 = new ValidatorImpl({ foo: 'bar' } as unknown).notIn(
        [{ foo: 'bar' }, { bar: 'foo' }],
        { deep: true },
      );
      await expect(chain1.get()).resolves.toEqual({ foo: 'bar' });
      await expect(chain2.get()).rejects.toThrow(ValidationError);
    });
  });
});
