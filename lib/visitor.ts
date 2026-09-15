const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const VISITOR_COOKIE = "visitor_id";

export function isValidVisitorId(value: string): boolean {
  return UUID_RE.test(value);
}

export function ensureVisitorId(existing: string | undefined): {
  visitorId: string;
  setCookie: boolean;
} {
  if (existing && isValidVisitorId(existing)) {
    return { visitorId: existing, setCookie: false };
  }
  return { visitorId: crypto.randomUUID(), setCookie: true };
}
