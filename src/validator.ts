import type { BaseMethods, IBaseMethods } from './methods/base';

import type validate from './index'; // eslint-disable-line

/**
 * Groups all validation methods.
 *
 * @remarks Implemented by {@link ValidatorImpl}.
 *
 * @internal
 */
export interface IValidator<Return> extends IBaseMethods<Return> {}

/**
 * A chainable validator instance returned by {@link validate | validate()}.
 *
 * @typeParam Return - The type of the validated value.
 * @typeParam State - The internal state of the validator.
 */
export type Validator<Return> = BaseMethods<Return>;

/** @internal */
export default class ValidatorImpl<Return> implements IValidator<Return> {
  private value: Return;
  private name: string | undefined;

  public constructor(value: Return, name?: string) {
    this.value = value;
    this.name = name;
  }

  public get() {
    return this.value;
  }
}
