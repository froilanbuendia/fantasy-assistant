import { describe, expect, it } from "vitest";
import { groupByRosterId, groupByPosition } from "@/lib/group-picks";
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

describe("groupByRosterId", () => {
  it("groups picks under their roster_id, preserving input order within a group", () => {
    const picks = [
      { ...BASE_PICK, pick_no: 1, roster_id: 1 },
      { ...BASE_PICK, pick_no: 2, roster_id: 2 },
      { ...BASE_PICK, pick_no: 3, roster_id: 1 },
    ];

    const grouped = groupByRosterId(picks);

    expect([...grouped.keys()]).toEqual([1, 2]);
    expect(grouped.get(1)!.map((p) => p.pick_no)).toEqual([1, 3]);
    expect(grouped.get(2)!.map((p) => p.pick_no)).toEqual([2]);
  });

  it("returns an empty map for no picks", () => {
    expect(groupByRosterId([]).size).toBe(0);
  });
});

describe("groupByPosition", () => {
  it("orders known positions QB, RB, WR, TE, K regardless of input order", () => {
    const picks = [
      { ...BASE_PICK, pick_no: 1, position: "K" },
      { ...BASE_PICK, pick_no: 2, position: "WR" },
      { ...BASE_PICK, pick_no: 3, position: "QB" },
    ];

    expect([...groupByPosition(picks).keys()]).toEqual(["QB", "WR", "K"]);
  });

  it("buckets a null position as Unknown and sorts it after known positions", () => {
    const picks = [
      { ...BASE_PICK, pick_no: 1, position: null },
      { ...BASE_PICK, pick_no: 2, position: "QB" },
    ];

    expect([...groupByPosition(picks).keys()]).toEqual(["QB", "Unknown"]);
  });
});
