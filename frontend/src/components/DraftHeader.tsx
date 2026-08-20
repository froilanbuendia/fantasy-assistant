"use client";

type Tab = "draft" | "teams";

export function DraftHeader({
  active,
  onChange,
  round,
  pick,
  isLive,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
  round: number;
  pick: number;
  isLive: boolean;
}) {
  return (
    <div className="flex w-full flex-row items-center justify-between bg-[#0F1729] px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-[16px] font-medium text-white">Dynasty Draft</span>
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 font-mono text-[11px] text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            LIVE
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-full bg-white/10 p-[3px]">
        <button
          type="button"
          onClick={() => onChange("draft")}
          className={
            active === "draft"
              ? "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-900"
              : "rounded-full px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200"
          }
        >
          Draft board
        </button>
        <button
          type="button"
          onClick={() => onChange("teams")}
          className={
            active === "teams"
              ? "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-900"
              : "rounded-full px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200"
          }
        >
          Teams
        </button>
      </div>

      <span className="font-mono text-[12px] text-slate-400">
        round {round} · pick {pick}
      </span>
    </div>
  );
}
