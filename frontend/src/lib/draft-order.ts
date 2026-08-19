// Snake draft with 3rd-round reversal (this league's draft.settings.reversal_round
// is 3, confirmed against real /draft/{id}/picks order): rounds before the
// reversal round alternate normally, the reversal round repeats the previous
// round's order instead of flipping, and normal alternation resumes after
// that — round 4 flips relative to round 3, round 5 flips relative to round
// 4, etc. Only affects the guessed label on not-yet-made picks; picks that
// have actually happened use their real pick_no instead.
export function positionInRound(
  round: number,
  slot: number,
  numSlots: number,
  reversalRound = 3,
): number {
  const ascending = round < reversalRound ? round % 2 === 1 : round % 2 === 0;
  return ascending ? slot : numSlots - slot + 1;
}

// slot_to_roster_id is the draft's fixed, trade-independent slot ownership
// (from the draft object). A pick was traded when whoever actually made it
// isn't who originally owned that slot.
export function isTradedPick(
  actualRosterId: number,
  draftSlot: number,
  slotToRosterId: Record<string, number>,
): boolean {
  const originalOwner = slotToRosterId[String(draftSlot)];
  return originalOwner !== undefined && originalOwner !== actualRosterId;
}
