// League roster settings (dynasty superflex, 12-team) — see CLAUDE.md.
// Starter counts are the position's own dedicated slots; FLEX/SUPERFLEX are
// separate shared slots drawn from an eligible-position pool, not assigned
// to specific players here (the draft alone doesn't tell us who a manager
// will actually start).
const STARTER_SLOTS: Record<string, number> = { QB: 1, RB: 2, WR: 3, TE: 1, K: 1 };
const FLEX_ELIGIBLE = new Set(["RB", "WR", "TE"]);
const SUPERFLEX_ELIGIBLE = new Set(["QB", "RB", "WR", "TE"]);

export function slotNoteFor(position: string): string {
  const starters = STARTER_SLOTS[position];
  const pools = [
    FLEX_ELIGIBLE.has(position) && "FLEX",
    SUPERFLEX_ELIGIBLE.has(position) && "SUPERFLEX",
  ].filter(Boolean);

  if (starters === undefined) {
    return pools.length ? `${pools.join("/")}-eligible` : "no starting slot";
  }

  const starterNote = `${starters} starter${starters === 1 ? "" : "s"}`;
  return pools.length ? `${starterNote} + ${pools.join("/")}-eligible` : starterNote;
}

export const POSITION_ORDER = ["QB", "RB", "WR", "TE", "K"];
