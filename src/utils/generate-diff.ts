/**
 * A simple diff generator that uses the Longest Common Subsequence (LCS)
 * algorithm to compare two multiline strings.
 *
 * @returns A unified diff `string`.
 *
 * @internal
 */
export default function generateDiff(oldText: string, newText: string) {
  const a = oldText.split('\n');
  const b = newText.split('\n');
  const m = a.length === 1 && a[0] === '' ? 0 : a.length;
  const n = b.length === 1 && b[0] === '' ? 0 : b.length;

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
  const parts: string[] = [];

  // Construct the diff from the DP table.
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      parts.push(`  ${a[i - 1]}`);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      parts.push(`- ${a[i - 1]}`);
      i--;
    } else {
      parts.push(`+ ${b[j - 1]}`);
      j--;
    }
  }

  // Add remaining lines from oldText.
  while (i > 0) {
    parts.push(`- ${a[i - 1]}`);
    i--;
  }

  // Add remaining lines from newText.
  while (j > 0) {
    parts.push(`+ ${b[j - 1]}`);
    j--;
  }

  return parts.reverse().join('\n');
}
