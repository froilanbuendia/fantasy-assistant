// Categorical palette, fixed hue order (CVD-safety depends on the order,
// not the hue names) — see the dataviz skill's references/palette.md.
// Used as a subtle tint + left-border accent, never as text color, so
// legibility never depends on text-over-saturated-fill contrast.
const POSITION_COLORS: Record<string, string> = {
  QB: "border-l-[#2a78d6] bg-[#2a78d6]/10 dark:border-l-[#3987e5] dark:bg-[#3987e5]/15",
  RB: "border-l-[#008300] bg-[#008300]/10 dark:border-l-[#008300] dark:bg-[#008300]/15",
  WR: "border-l-[#e87ba4] bg-[#e87ba4]/10 dark:border-l-[#d55181] dark:bg-[#d55181]/15",
  TE: "border-l-[#eda100] bg-[#eda100]/10 dark:border-l-[#c98500] dark:bg-[#c98500]/15",
  K: "border-l-[#1baf7a] bg-[#1baf7a]/10 dark:border-l-[#199e70] dark:bg-[#199e70]/15",
};

// Rare catch-all (unresolved position, e.g. DEF) — neutral, not a 6th hue,
// so it never competes visually with the real categorical colors above.
const OTHER_COLOR = "border-l-zinc-400 bg-zinc-200/40 dark:border-l-zinc-600 dark:bg-zinc-800/40";

export function positionColorClass(position: string | null): string {
  if (!position) return OTHER_COLOR;
  return POSITION_COLORS[position] ?? OTHER_COLOR;
}

export const POSITION_LEGEND = [...Object.keys(POSITION_COLORS), "Other"];
