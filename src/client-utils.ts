export type PageSeriesEntry = number | "ellipsis";

export function buildPageSeries(totalPages: number, currentPage: number): PageSeriesEntry[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  const result: PageSeriesEntry[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index];
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }
  return result;
}

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isFinite(page)) {
    return 1;
  }
  return Math.min(Math.max(1, Math.floor(page)), Math.max(1, totalPages));
}

export function tagPathSegment(tag: string): string {
  return Array.from(new TextEncoder().encode(tag.normalize("NFC")))
    .map((byte) => {
      const isLetter = (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122);
      const isNumber = byte >= 48 && byte <= 57;
      if (isLetter || isNumber || byte === 45) {
        return String.fromCharCode(byte);
      }
      return `~${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    })
    .join("");
}
