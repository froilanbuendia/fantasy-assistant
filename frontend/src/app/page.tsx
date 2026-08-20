"use client";

import { useRouter } from "next/navigation";
import { useDraftPicks } from "@/lib/use-draft-picks";
import { teamLabel } from "@/lib/team-label";
import { playerImageUrl } from "@/lib/player-image";
import { positionColorClass, POSITION_LEGEND } from "@/lib/position-colors";
import { positionInRound, isTradedPick } from "@/lib/draft-order";
import { currentDraftPosition } from "@/lib/draft-position";
import { Avatar } from "@/components/avatar";
import { DraftHeader } from "@/components/DraftHeader";
import type { DraftPick, Team } from "@/lib/draft-picks";

export default function Home() {
  const router = useRouter();
  const { picks, teams, slotToRosterId, leagueName, error, lastUpdated } = useDraftPicks();

  const numSlots = Object.keys(slotToRosterId ?? {}).length;
  const teamsById = new Map((teams ?? []).map((team) => [team.roster_id, team]));

  // Nothing in the API response says whether the draft is still active, so
  // isLive is left unwired below rather than guessed from a proxy.
  const { round: currentRound, pick: currentPickInRound } = currentDraftPosition(picks ?? [], numSlots);

  function handleHeaderTabChange(tab: "draft" | "teams") {
    if (tab === "teams") {
      router.push("/teams");
    }
  }

  const pickByRoundAndSlot = new Map<string, DraftPick>();
  let maxRound = 0;
  for (const pick of picks ?? []) {
    pickByRoundAndSlot.set(`${pick.round}:${pick.draft_slot}`, pick);
    maxRound = Math.max(maxRound, pick.round);
  }
  const rounds = Array.from({ length: Math.max(maxRound, 1) }, (_, i) => i + 1);
  const slots = Array.from({ length: numSlots }, (_, i) => i + 1);

  // slot_to_roster_id comes from the draft object, not the picks, so it's
  // unaffected by mid-draft trades — the correct source for "whose column
  // is this," unlike inferring it from whichever pick landed in that slot.
  function slotOwner(slot: number): number | undefined {
    return slotToRosterId?.[String(slot)];
  }

  function columnHeader(slot: number): { label: string; team: Team | undefined } {
    const rosterId = slotOwner(slot);
    const team = rosterId !== undefined ? teamsById.get(rosterId) : undefined;
    return { label: team ? teamLabel(team, rosterId!) : `Slot ${slot}`, team };
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <DraftHeader
        title={leagueName ?? "Dynasty Draft"}
        active="draft"
        onChange={handleHeaderTabChange}
        round={currentRound}
        pick={currentPickInRound}
        isLive={false}
      />
      <main className="flex w-full flex-1 flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Draft Board
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading…"}
          </p>
        </header>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {(picks === null || teams === null || slotToRosterId === null) && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading picks…</p>
        )}

        {picks !== null && picks.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No picks yet — check back once the draft starts.
          </p>
        )}

        {picks !== null && teams !== null && slotToRosterId !== null && picks.length > 0 && numSlots > 0 && (
          <>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              {POSITION_LEGEND.map((position) => (
                <span key={position} className="flex items-center gap-1.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-sm border-l-2 ${positionColorClass(position === "Other" ? null : position)}`}
                  />
                  {position}
                </span>
              ))}
            </div>

            <div className="overflow-x-auto">
              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${numSlots}, minmax(150px, 1fr))` }}
              >
                {slots.map((slot) => {
                  const { label, team } = columnHeader(slot);
                  return (
                    <div key={`head-${slot}`} className="flex flex-col items-center gap-1 pb-1 text-center">
                      <Avatar src={team?.avatar_url ?? null} label={label} />
                      <span className="truncate text-xs font-medium text-zinc-950 dark:text-zinc-50">
                        {label}
                      </span>
                    </div>
                  );
                })}

                {rounds.map((round) =>
                  slots.map((slot) => {
                    const pick = pickByRoundAndSlot.get(`${round}:${slot}`);
                    if (!pick) {
                      return (
                        <div
                          key={`${round}-${slot}`}
                          className="flex flex-col justify-center gap-1 rounded-md border border-dashed border-zinc-200 p-2 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-600"
                        >
                          {round}.{positionInRound(round, slot, numSlots)}
                        </div>
                      );
                    }
                    const playerLabel = pick.player_name ?? "Unknown player";
                    const pickInRound = ((pick.pick_no - 1) % numSlots) + 1;
                    const traded = isTradedPick(pick.roster_id, pick.draft_slot, slotToRosterId ?? {});
                    const pickedByLabel = traded
                      ? teamLabel(teamsById.get(pick.roster_id), pick.roster_id)
                      : null;
                    return (
                      <div
                        key={`${round}-${slot}`}
                        className={`flex flex-col gap-1 rounded-md border-l-4 p-2 ${positionColorClass(pick.position)}`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar src={playerImageUrl(pick.player_id)} label={playerLabel} size="sm" />
                          <span className="truncate text-xs font-medium text-zinc-950 dark:text-zinc-50">
                            {playerLabel}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {[pick.position, pick.team].filter(Boolean).join(" · ") || "—"}
                        </span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          {round}.{pickInRound}
                        </span>
                        {pickedByLabel && (
                          <span className="truncate text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            → {pickedByLabel}
                          </span>
                        )}
                      </div>
                    );
                  }),
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
