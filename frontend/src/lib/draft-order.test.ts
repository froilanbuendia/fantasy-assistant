import { describe, expect, it } from "vitest";
import { positionInRound } from "@/lib/draft-order";

describe("positionInRound", () => {
  it("keeps ascending slot order on odd rounds", () => {
    expect(positionInRound(1, 1, 12)).toBe(1);
    expect(positionInRound(1, 12, 12)).toBe(12);
  });

  it("reverses slot order on even rounds (snake draft)", () => {
    expect(positionInRound(2, 1, 12)).toBe(12);
    expect(positionInRound(2, 12, 12)).toBe(1);
  });

  it("matches the real pick_no math for a 12-team league", () => {
    // Round 2, slot 1 is the 24th overall pick -> "2.12" per Sleeper's board.
    const numSlots = 12;
    const globalPickNo = 24;
    const pickInRound = ((globalPickNo - 1) % numSlots) + 1;
    expect(positionInRound(2, 1, numSlots)).toBe(pickInRound);
  });
});
