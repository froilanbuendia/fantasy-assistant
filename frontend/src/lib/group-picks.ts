import { POSITION_ORDER } from "@/lib/roster-slots";
import type { DraftPick } from "@/lib/draft-picks";

export function groupByRosterId(picks: DraftPick[]): Map<number, DraftPick[]> {
  const byRoster = new Map<number, DraftPick[]>();
  for (const pick of picks) {
    const group = byRoster.get(pick.roster_id) ?? [];
    group.push(pick);
    byRoster.set(pick.roster_id, group);
  }
  return byRoster;
}

export function groupByPosition(picks: DraftPick[]): Map<string, DraftPick[]> {
  // Seed every roster position up front so e.g. TE/K still show a (empty)
  // section even before a team has drafted one — "Unknown" is a fallback
  // bucket, not a real slot, so it's only added when actually needed.
  const positions = new Map<string, DraftPick[]>(POSITION_ORDER.map((position) => [position, []]));
  for (const pick of picks) {
    const position = pick.position ?? "Unknown";
    const group = positions.get(position) ?? [];
    group.push(pick);
    positions.set(position, group);
  }
  const ordered = [...positions.keys()].sort((a, b) => {
    const ia = POSITION_ORDER.indexOf(a);
    const ib = POSITION_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return new Map(ordered.map((position) => [position, positions.get(position)!]));
}
