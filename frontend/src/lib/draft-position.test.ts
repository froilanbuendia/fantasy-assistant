import { describe, expect, it } from "vitest";
import { currentDraftPosition } from "@/lib/draft-position";
import type { DraftPick } from "@/lib/draft-picks";

const BASE_PICK: DraftPick = {
  pick_no: 1,
  round: 1,
  draft_slot: 1,
  roster_id: 1,
  picked_by: "user1",
  is_keeper: null,
  player_id: "100",
  player_name: "Josh Allen",
  position: "QB",
  team: "BUF",
};

describe("currentDraftPosition", () => {
  it("returns round 1, pick 1 when no picks have happened yet", () => {
    expect(currentDraftPosition([], 12)).toEqual({ round: 1, pick: 1 });
  });

  it("returns round 1, pick 1 when numSlots is unknown (0)", () => {
    expect(currentDraftPosition([{ ...BASE_PICK, pick_no: 5 }], 0)).toEqual({ round: 1, pick: 1 });
  });

  it("computes the next pick's round/pick-in-round from the highest pick_no seen", () => {
    // 12-team league, 13 picks made -> next pick is #14, round 2 pick 2.
    const picks = Array.from({ length: 13 }, (_, i) => ({ ...BASE_PICK, pick_no: i + 1 }));
    expect(currentDraftPosition(picks, 12)).toEqual({ round: 2, pick: 2 });
  });

  it("doesn't assume picks arrive in order", () => {
    const picks = [{ ...BASE_PICK, pick_no: 3 }, { ...BASE_PICK, pick_no: 1 }, { ...BASE_PICK, pick_no: 2 }];
    expect(currentDraftPosition(picks, 12)).toEqual({ round: 1, pick: 4 });
  });
});
