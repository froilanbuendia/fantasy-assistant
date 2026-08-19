import { describe, expect, it } from "vitest";
import { positionColorClass, POSITION_LEGEND } from "@/lib/position-colors";

describe("positionColorClass", () => {
  it("returns a distinct class for each known position", () => {
    const classes = ["QB", "RB", "WR", "TE", "K"].map(positionColorClass);
    expect(new Set(classes).size).toBe(5);
  });

  it("falls back to the neutral Other color for null", () => {
    expect(positionColorClass(null)).toContain("zinc");
  });

  it("falls back to the neutral Other color for an unrecognized position", () => {
    expect(positionColorClass("DEF")).toBe(positionColorClass(null));
  });

  it("never colors the Other fallback the same as a real position (was WR before the fix)", () => {
    expect(positionColorClass(null)).not.toBe(positionColorClass("WR"));
  });
});

describe("POSITION_LEGEND", () => {
  it("lists every known position plus Other", () => {
    expect(POSITION_LEGEND).toEqual(["QB", "RB", "WR", "TE", "K", "Other"]);
  });
});
