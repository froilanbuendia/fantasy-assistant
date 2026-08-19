import { describe, expect, it } from "vitest";
import { positionInRound, isTradedPick } from "@/lib/draft-order";

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

  it("repeats the previous round's order on the reversal round instead of flipping", () => {
    // Verified against this league's real pick order: round 3 == round 2's
    // order (descending), not the ascending order plain snake would give.
    expect(positionInRound(3, 1, 12, 3)).toBe(positionInRound(2, 1, 12, 3));
    expect(positionInRound(3, 12, 12, 3)).toBe(1);
  });

  it("resumes normal alternation after the reversal round", () => {
    // Round 4 flips relative to round 3 (which itself repeated round 2).
    expect(positionInRound(4, 1, 12, 3)).toBe(1);
    expect(positionInRound(5, 1, 12, 3)).toBe(12);
  });

  it("matches real round 1-4 draft_slot order from this league's live picks", () => {
    // Confirmed via GET /v1/draft/{id}/picks: round 1 ascending, round 2
    // descending, round 3 repeats round 2, round 4 flips back to ascending.
    const numSlots = 12;
    expect([1, 2, 3].map((slot) => positionInRound(1, slot, numSlots))).toEqual([1, 2, 3]);
    expect([1, 2, 3].map((slot) => positionInRound(2, slot, numSlots))).toEqual([12, 11, 10]);
    expect([1, 2, 3].map((slot) => positionInRound(3, slot, numSlots))).toEqual([12, 11, 10]);
    expect([1, 2, 3].map((slot) => positionInRound(4, slot, numSlots))).toEqual([1, 2, 3]);
  });
});

describe("isTradedPick", () => {
  const slotToRosterId = { "1": 6, "2": 3, "3": 7 };

  it("returns false when the pick's roster matches the slot's original owner", () => {
    expect(isTradedPick(6, 1, slotToRosterId)).toBe(false);
  });

  it("returns true when the pick's roster differs from the slot's original owner", () => {
    expect(isTradedPick(3, 1, slotToRosterId)).toBe(true);
  });

  it("returns false when the slot's owner is unknown (not yet loaded)", () => {
    expect(isTradedPick(6, 99, slotToRosterId)).toBe(false);
  });
});
