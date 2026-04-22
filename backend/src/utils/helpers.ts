import axios from "axios";

export function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const normalizeChunk = (chunk: any) => {
  if (typeof chunk === "string") {
    return chunk;
  }
  if (Array.isArray(chunk)) {
    return chunk
      .map((item) => (typeof item === "string" ? item : item.text || ""))
      .join("");
  }
  return "";
};


export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Calculates string similarity using Levenshtein distance.
 * Returns a value between 0 (completely different) and 1 (identical).
 */
/**
 * Calculates string similarity.
 * Combines Levenshtein-based similarity with word-based Jaccard similarity
 * for better handling of partial and fuzzy matches.
 */
export function calculateSimilarity(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();

  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  // 1. Word-based Jaccard Similarity
  const words1 = new Set(str1.split(/[^a-z0-9]+/).filter(Boolean));
  const words2 = new Set(str2.split(/[^a-z0-9]+/).filter(Boolean));

  const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);
  const jaccard = intersection.size / union.size;

  // 2. Contains check (frequent in location matches like "Kangra" in "Kangra (Baijnath)")
  let contains = 0;
  if (str1.includes(str2) || str2.includes(str1)) {
    contains = Math.min(str1.length, str2.length) / Math.max(str1.length, str2.length);
  }

  // 3. Levenshtein-based (for spelling errors)
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array.from({ length: len1 + 1 }, () => new Int32Array(len2 + 1));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const levenshtein = (Math.max(len1, len2) - distance) / Math.max(len1, len2);

  // Return the maximum of these metrics
  return Math.max(jaccard, contains, levenshtein);
}


