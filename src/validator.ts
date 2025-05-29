import isEqual from './utils/is-equal';
import stringify from './utils/stringify';
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
import type { IsPossibly, Override } from './utils/types';

import type validate from './index'; // eslint-disable-line

/** @internal */
export interface ValidatorState {
  isNullableApplied: boolean;
  canSetFallback: boolean;
}

/**
 * Groups all validation methods.
 *
 * @remarks Implemented by {@link ValidatorImpl}.
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
 * @typeParam Return - The type of the validated value.
 * @typeParam State - The internal state of the validator.
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
  private opts = {
    isRequired: false,
    allowNull: false,
  };

  public constructor(value: Return, name?: string) {
    this.value = value;
    this.name = name;
  }

  public get() {
    if (this.opts.isRequired && this.isValueMissing) {
      this.fail(
        `value is required but was ${this.value === null ? 'null' : 'undefined'}`,
      );
    }
    for (const fn of this.chain) fn();
    return this.value;
  }

  public setFallback<Options extends NullableOptions>(
    value: RequiredReturn<Return, Options>,
    options?: Options,
  ) {
    const { allowNull = false } = options ?? {};
    this.opts.allowNull = allowNull;
    if (this.isValueMissing) this.value = value as Return;
    return this.refine<
      RequiredReturn<Return, Options>,
      Override<State, { canSetFallback: false; isNullableApplied: true }>
    >();
  }

  public isRequired<Options extends NullableOptions>(options?: Options) {
    const { allowNull = false } = options ?? {};
    this.opts.allowNull = allowNull;
    this.opts.isRequired = true;
    return this.refine<
      RequiredReturn<Return, Options>,
      Override<State, { isNullableApplied: true }>
    >();
  }

  public notRequired() {
    return this.refine<Return, Override<State, { isNullableApplied: true }>>();
  }

  public isEqual<const Value extends Return>(
    value: Value,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => {
      if (!isEqual(this.value, value, options)) {
        this.fail(`expected value to equal ${stringify(value)}`);
      }
    });
    return this.refine<Value>();
  }

  public notEqual<const Value extends Return>(
    value: Value,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => {
      if (isEqual(this.value, value, options)) {
        this.fail(`expected value to NOT equal: ${stringify(value)}`);
      }
    });
    return this.refine<Exclude<Return, Value>>();
  }

  public isIn<const Values extends readonly Return[]>(
    values: Values,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => {
      if (values.every((v) => !isEqual(this.value, v, options))) {
        this.fail(`expected value to be one of: ${stringify(values)}`);
      }
    });
    return this.refine<Values[number]>();
  }

  public notIn<const Values extends readonly Return[]>(
    values: Values,
    options?: EqualityOptions,
  ) {
    this.chain.push(() => {
      if (values.some((v) => isEqual(this.value, v, options))) {
        this.fail(`expected value NOT to be any of: ${stringify(values)}`);
      }
    });
    return this.refine<Exclude<Return, Values[number]>>();
  }

  private refine<NewReturn, NewState extends ValidatorState = State>() {
    return this as unknown as Validator<NewReturn, NewState>;
  }

  private fail(message: string) {
    const prefix = this.name
      ? `Validation failed for '${this.name}':`
      : 'Validation failed:';
    throw new ValidationError(`${prefix} ${message}`);
  }

  private get isValueMissing() {
    return (
      this.value === void 0 || (!this.opts.allowNull && this.value === null)
    );
  }
}
