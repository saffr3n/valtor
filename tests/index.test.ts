import { describe, it, expect } from '@jest/globals';
import validate from '../src';

describe('validate', () => {
  it("returns a working 'Validator' instance", async () => {
    const TEST_NUM = await validate(process.env.TEST_NUM)
      .isRequired()
      .setFallback('42')
      .custom((v) => {
        const num = Number(v);
        if (!isNaN(num)) return num;
        throw new Error('not a number');
      })
      .get();
    expect(TEST_NUM).toBe(42);
  });
});
