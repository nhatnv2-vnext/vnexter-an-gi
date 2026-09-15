import { describe, it, expect } from "vitest";
import { ensureVisitorId, isValidVisitorId } from "@/lib/visitor";

describe("ensureVisitorId", () => {
  it("reuses existing valid uuid", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const result = ensureVisitorId(id);
    expect(result.visitorId).toBe(id);
    expect(result.setCookie).toBe(false);
  });

  it("creates new id when missing", () => {
    const result = ensureVisitorId(undefined);
    expect(isValidVisitorId(result.visitorId)).toBe(true);
    expect(result.setCookie).toBe(true);
  });

  it("creates new id when invalid", () => {
    const result = ensureVisitorId("not-a-uuid");
    expect(isValidVisitorId(result.visitorId)).toBe(true);
    expect(result.setCookie).toBe(true);
  });
});
