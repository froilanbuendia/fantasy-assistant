import { afterEach, describe, expect, it, vi } from "vitest";
import { getDraftPicks } from "@/lib/draft-picks";

describe("getDraftPicks", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("throws when NEXT_PUBLIC_DRAFT_API_URL is not set", async () => {
    vi.stubEnv("NEXT_PUBLIC_DRAFT_API_URL", "");

    await expect(getDraftPicks()).rejects.toThrow("NEXT_PUBLIC_DRAFT_API_URL is not set");
  });

  it("throws when the response is not ok", async () => {
    vi.stubEnv("NEXT_PUBLIC_DRAFT_API_URL", "https://example.com/picks");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    await expect(getDraftPicks()).rejects.toThrow("Draft picks request failed: 500");
  });

  it("returns the parsed JSON body on success", async () => {
    vi.stubEnv("NEXT_PUBLIC_DRAFT_API_URL", "https://example.com/picks");
    const body = { league_id: "l1", draft_id: "d1", teams: [], picks: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => body }));

    await expect(getDraftPicks()).resolves.toEqual(body);
  });

  it("fetches with cache: no-store so polling always gets fresh data", async () => {
    vi.stubEnv("NEXT_PUBLIC_DRAFT_API_URL", "https://example.com/picks");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await getDraftPicks();

    expect(fetchMock).toHaveBeenCalledWith("https://example.com/picks", { cache: "no-store" });
  });
});
