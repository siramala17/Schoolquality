const TZ = "Asia/Bangkok";

/** yyyy-MM in Asia/Bangkok, used for grouping (stable across server/client locales). */
export function bangkokYearMonth(d: Date | string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
  const parts = fmt.formatToParts(new Date(d));
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  return `${year}-${month}`;
}

export function fmtDateTH(d: Date | string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric", timeZone: TZ });
}

export function fmtDateTimeTH(d: Date | string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleString("th-TH", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ,
  });
}

export function toDateInputValue(d: Date | string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(new Date(d));
}
