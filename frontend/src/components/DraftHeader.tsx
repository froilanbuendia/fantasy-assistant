"use client";

type Tab = "draft" | "teams";

export function DraftHeader({
  title,
  active,
  onChange,
  round,
  pick,
  isLive,
}: {
  title: string;
  active: Tab;
  onChange: (tab: Tab) => void;
  round: number;
  pick: number;
  isLive: boolean;
}) {
  return (
    <div className="grid w-full grid-cols-3 items-center bg-[#0F1729] px-5 py-4">
      <div className="flex items-center justify-self-start gap-3">
        <span className="text-[16px] font-medium text-white">{title}</span>
        {isLive && (
          <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 font-mono text-[11px] text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            LIVE
          </span>
        )}
      </div>

      <div className="flex items-center justify-self-center gap-1 rounded-full bg-white/10 p-[3px]">
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

      <span className="justify-self-end font-mono text-[12px] text-slate-400">
        round {round} · pick {pick}
      </span>
    </div>
  );
}
