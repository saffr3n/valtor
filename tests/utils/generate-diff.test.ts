import { describe, it, expect } from '@jest/globals';
import generateDiff from '../../src/utils/generate-diff';

describe('generateDiff', () => {
  it('handles identical texts', () => {
    const text = 'a\nb\nc';
    const diff = generateDiff(text, text);
    expect(diff).toBe('  a\n  b\n  c');
  });

  it('marks added lines', () => {
    const oldText = 'a\nb';
    const newText = 'a\nb\nc';
    const diff = generateDiff(oldText, newText);
    expect(diff).toBe('  a\n  b\n+ c');
  });

  it('marks removed lines', () => {
    const oldText = 'a\nb\nc';
    const newText = 'a\nc';
    const diff = generateDiff(oldText, newText);
    expect(diff).toBe('  a\n- b\n  c');
  });

  it('handles both additions and deletions', () => {
    const oldText = 'a\nb\nc\nd';
    const newText = 'a\nx\nc\ny';
    const diff = generateDiff(oldText, newText);
    expect(diff).toBe('  a\n+ x\n- b\n  c\n+ y\n- d');
  });

  it('handles completely different texts', () => {
    const oldText = '1\n2\n3';
    const newText = 'a\nb\nc';
    const diff = generateDiff(oldText, newText);
    expect(diff).toBe('+ a\n+ b\n+ c\n- 1\n- 2\n- 3');
  });

  it('handles empty to non-empty', () => {
    const text = 'a\nb';
    const diff = generateDiff('', text);
    expect(diff).toBe('+ a\n+ b');
  });

  it('handles non-empty to empty', () => {
    const text = 'a\nb';
    const diff = generateDiff(text, '');
    expect(diff).toBe('- a\n- b');
  });

  it('handles multiline texts with repeating lines', () => {
    const oldText = 'x\ny\nx\nz';
    const newText = 'x\na\nx\nz';
    const diff = generateDiff(oldText, newText);
    expect(diff).toBe('  x\n+ a\n- y\n  x\n  z');
  });
});
