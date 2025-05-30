/**
 * A simple diff generator that uses the Longest Common Subsequence (LCS)
 * algorithm to compare two multiline strings.
 *
 * @returns A unified diff `string`.
 *
 * @internal
 */
export default function generateDiff(actual: string, expected: string) {
  const a = expected.split('\n');
  const b = actual.split('\n');
  const m = a.length;
  const n = b.length;

  // Create a DP table with (m + 1) x (n + 1) dimensions.
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );

  // Populate the DP table with LCS lengths.
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = m;
  let j = n;
  const parts: { value: string; type: 'equal' | 'delete' | 'insert' }[] = [];

  // Construct the diff from the DP table.
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      parts.push({ value: a[i - 1], type: 'equal' });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      parts.push({ value: a[i - 1], type: 'delete' });
      i--;
    } else {
      parts.push({ value: b[j - 1], type: 'insert' });
      j--;
    }
  }

  // Add remaining lines from expected.
  while (i > 0) {
    parts.push({ value: a[i - 1], type: 'delete' });
    i--;
  }

  // Add remaining lines from actual.
  while (j > 0) {
    parts.push({ value: b[j - 1], type: 'insert' });
    j--;
  }

  // Build and return the diff output string.
  let diff = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    switch (part.type) {
      case 'equal':
        diff += `  ${part.value}`;
        break;
      case 'delete':
        diff += `- ${part.value}`;
        break;
      case 'insert':
        diff += `+ ${part.value}`;
        break;
    }
    if (i !== 0) diff += '\n';
  }
  return diff;
}
