export function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

export function normalizeGeneralText(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeGovernmentWarning(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenSimilarity(a: string, b: string): number {
  if (!a || !b) {
    return 0;
  }

  if (a === b) {
    return 1;
  }

  const tokensA = new Set(a.split(" "));
  const tokensB = new Set(b.split(" "));

  let overlap = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      overlap += 1;
    }
  });

  return (2 * overlap) / (tokensA.size + tokensB.size);
}
