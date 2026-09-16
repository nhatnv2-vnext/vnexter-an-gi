/** Hours helpers — times like "08:00" / "21:30" in Asia/Ho_Chi_Minh */

function parseHm(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function isOpenAt(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
  nowMinutes: number,
): boolean | null {
  if (!openTime || !closeTime) return null;
  const open = parseHm(openTime);
  const close = parseHm(closeTime);
  if (open === null || close === null) return null;
  if (open === close) return true;
  if (open < close) return nowMinutes >= open && nowMinutes < close;
  // Overnight window (e.g. 18:00–02:00)
  return nowMinutes >= open || nowMinutes < close;
}

export function minutesNowInHanoi(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

export function isOpenNow(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
  now = new Date(),
): boolean | null {
  return isOpenAt(openTime, closeTime, minutesNowInHanoi(now));
}

export function formatHoursLabel(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
): string | null {
  if (openTime && closeTime) return `${openTime}–${closeTime}`;
  if (closeTime) return `Mở đến ${closeTime}`;
  if (openTime) return `Từ ${openTime}`;
  return null;
}
