// Snake draft: odd rounds go slot 1→N, even rounds reverse N→1.
export function positionInRound(round: number, slot: number, numSlots: number): number {
  return round % 2 === 1 ? slot : numSlots - slot + 1;
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
