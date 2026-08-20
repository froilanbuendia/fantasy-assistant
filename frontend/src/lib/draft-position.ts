import type { DraftPick } from "@/lib/draft-picks";

// "Next pick" = current draft position (who's on the clock), derived from
// the highest pick_no seen so far.
export function currentDraftPosition(
  picks: DraftPick[],
  numSlots: number,
): { round: number; pick: number } {
  if (numSlots === 0) return { round: 1, pick: 1 };

  const maxPickNo = picks.reduce((max, p) => Math.max(max, p.pick_no), 0);
  const nextPickNo = maxPickNo + 1;
  return {
    round: Math.ceil(nextPickNo / numSlots),
    pick: ((nextPickNo - 1) % numSlots) + 1,
  };
}
