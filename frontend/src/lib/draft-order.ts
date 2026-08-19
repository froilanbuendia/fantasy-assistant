// Snake draft: odd rounds go slot 1→N, even rounds reverse N→1.
export function positionInRound(round: number, slot: number, numSlots: number): number {
  return round % 2 === 1 ? slot : numSlots - slot + 1;
}
