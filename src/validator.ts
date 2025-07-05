import isEqual from './utils/is-equal';
import stringify from './utils/stringify';
import generateDiff from './utils/generate-diff';
import ValidationError from './utils/validation-error';
import type { BaseMethods, IBaseMethods } from './methods/base';
import type {
  INullableMethods,
  NullableMethods,
  NullableOptions,
  RequiredReturn,
} from './methods/nullable';
import type {
  EqualityMethods,
  EqualityOptions,
  IEqualityMethods,
} from './methods/equality';
import type { Exclude, Extract, IsPossibly, Override } from './utils/types';
import type validate from './index';

/** @internal */
export interface ValidatorState {
  isNullableApplied: boolean;
  canSetFallback: boolean;
}

/**
 * Groups all validation methods.
 *
 * Implemented by {@link ValidatorImpl}.
 *
 * @internal
 */
export interface IValidator<Return, State extends ValidatorState>
  extends IBaseMethods<Return>,
    INullableMethods<Return, State>,
    IEqualityMethods<Return, State> {}

/**
 * A chainable validator instance returned by {@link validate | validate()}.
 *
 * @template Return - The type of the validated value.
 *
 * @template State - The internal state of the validator.
 */
export type Validator<
  Return,
  State extends ValidatorState = {
    isNullableApplied: false;
    canSetFallback: IsPossibly<null | undefined, Return>;
  },
> = BaseMethods<Return>
  & NullableMethods<Return, State>
  & EqualityMethods<Return, State>;

/** @internal */
export default class ValidatorImpl<Return, State extends ValidatorState>
  implements IValidator<Return, State>
{
  private value: Return;
  private name: string | undefined;
  private chain: (() => void)[] = [];
  private assert;
  private opts = {
    allowNull: false,
  };

  public constructor(value: Return, name?: string) {
    this.value = value;
    this.name = name;
    this.assert = this.buildAssert();
  }

  public get() {
    for (const fn of this.chain) fn();
    return this.value;
  }

  public setFallback<Options extends NullableOptions>(
    value: RequiredReturn<Return, Options>,
    options?: Options,
  ) {
    this.opts.allowNull = options?.allowNull ?? false;
    if (this.isValueMissing) this.value = value as Return;
    return this.refine<
      RequiredReturn<Return, Options>,
      Override<State, { canSetFallback: false; isNullableApplied: true }>
    >();
  }

  public isRequired<Options extends NullableOptions>(options?: Options) {
    this.opts.allowNull = options?.allowNull ?? false;
    this.chain.push(() => this.assert.isRequired());
    return this.refine<
      RequiredReturn<Return, Options>,
      Override<State, { isNullableApplied: true }>
    >();
  }

  public notRequired() {
    return this.refine<Return, Override<State, { isNullableApplied: true }>>();
  }

  public isMissing<Options extends NullableOptions>(options?: Options) {
    this.opts.allowNull = options?.allowNull ?? false;
    this.chain.push(() => this.assert.isMissing());
    return this.refine<
      Extract<
        Return,
        Options['allowNull'] extends true ? undefined : null | undefined
      >,
      Override<State, { isNullableApplied: true; canSetFallback: false }>
    >();
  }

  public notMissing<Options extends NullableOptions>(options?: Options) {
    return this.isRequired(options);
  }

  public isEqual<const Value extends Return>(
    value: Value,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => this.assert.isEqual(value, options));
    return this.refine<Value>();
  }

  public notEqual<const Value extends Return>(
    value: Value,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => this.assert.notEqual(value, options));
    return this.refine<Exclude<Return, Value>>();
  }

  public isIn<const Values extends readonly Return[]>(
    values: Values,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => this.assert.isIn(values, options));
    return this.refine<Values[number]>();
  }

  public notIn<const Values extends readonly Return[]>(
    values: Values,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => this.assert.notIn(values, options));
    return this.refine<Exclude<Return, Values[number]>>();
  }

  private refine<NewReturn, NewState extends ValidatorState = State>() {
    return this as unknown as Validator<NewReturn, NewState>;
  }

  private get isValueMissing() {
    return (
      this.value === undefined || (!this.opts.allowNull && this.value === null)
    );
  }

  private buildAssert() {
    const subject = `The ${
      this.name ? `value of '${this.name}'` : 'validated value'
    }`;

    return {
      isRequired: () => {
        if (!this.isValueMissing) return;
        const actual = stringify(this.value);
        const msg = `${subject} is marked as required, but received ${actual}.`;
        throw new ValidationError(msg);
      },

      isMissing: () => {
        if (this.isValueMissing) return;
        const actual = stringify(this.value);
        const msg = `${subject} is marked as missing, but received ${actual}.`;
        throw new ValidationError(msg);
      },

      isEqual: (value: unknown, options?: EqualityOptions) => {
        if (isEqual(this.value, value, options)) return;
        const msg = `${subject} doesn't match the expected value.`;
        const actual = stringify(this.value);
        const expected = stringify(value);
        const diff = generateDiff(expected, actual);
        const detail = `Actual (+) vs (-) Expected:\n${diff}`;
        throw new ValidationError(`${msg}\n\n${detail}`);
      },

      notEqual: (value: unknown, options?: EqualityOptions) => {
        if (!isEqual(this.value, value, options)) return;
        const msg = `${subject} matches the forbidden value.`;
        const forbidden = stringify(value);
        const detail = `Forbidden:\n${forbidden}`;
        throw new ValidationError(`${msg}\n\n${detail}`);
      },

      isIn: (values: readonly unknown[], options?: EqualityOptions) => {
        if (values.some((v) => isEqual(this.value, v, options))) return;
        const msg = `${subject} doesn't match any of the expected values.`;
        const actual = stringify(this.value);
        const diffs = values.map((v) => {
          const expected = stringify(v);
          return generateDiff(expected, actual);
        });
        const list = this.listify(diffs);
        const detail = `Actual (+) vs (-) Expected:\n${list}`;
        throw new ValidationError(`${msg}\n\n${detail}`);
      },

      notIn: (values: readonly unknown[], options?: EqualityOptions) => {
        for (const v of values) {
          if (!isEqual(this.value, v, options)) continue;
          const msg = `${subject} matches one of the forbidden values.`;
          const prefixed = values.map((u) => {
            const forbidden = stringify(u);
            return this.prefixBlock(forbidden, u === v ? '>' : ' ');
          });
          const list = this.listify(prefixed);
          const detail = `Forbidden:\n${list}`;
          throw new ValidationError(`${msg}\n\n${detail}`);
        }
      },
    };
  }

  private listify(values: string[]) {
    return values.map((v) => this.prefixBlock(v, '•')).join('\n');
  }

  private prefixBlock(block: string, sign: string) {
    return block
      .split('\n')
      .map((l, i) => (i === 0 ? `${sign} ${l}` : `  ${l}`))
      .join('\n');
  }
}
