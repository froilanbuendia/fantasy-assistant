"use client";

import { useDraftPicks } from "@/lib/use-draft-picks";
import { teamLabel } from "@/lib/team-label";
import { playerImageUrl } from "@/lib/player-image";
import { Avatar } from "@/components/avatar";

export default function Home() {
  const { picks, teams, error, lastUpdated } = useDraftPicks();
  const teamsById = new Map((teams ?? []).map((team) => [team.roster_id, team]));

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-12">
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

        {picks === null && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading picks…</p>
        )}

        {picks !== null && picks.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No picks yet — check back once the draft starts.
          </p>
        )}

        {picks !== null && picks.length > 0 && (
          <ol className="flex flex-col gap-2">
            {picks.map((pick) => {
              const team = teamsById.get(pick.roster_id);
              const label = teamLabel(team, pick.roster_id);
              const playerLabel = pick.player_name ?? "Unknown player";
              return (
                <li
                  key={pick.pick_no}
                  className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 text-right font-mono text-sm text-zinc-400">
                      {pick.pick_no}
                    </span>
                    <Avatar src={playerImageUrl(pick.player_id)} label={playerLabel} size="lg" />
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-950 dark:text-zinc-50">
                        {playerLabel}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {[pick.position, pick.team].filter(Boolean).join(" · ") || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end text-xs text-zinc-500 dark:text-zinc-400">
                      <span>Round {pick.round}</span>
                      <span>{label}</span>
                    </div>
                    <Avatar src={team?.avatar_url ?? null} label={label} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </div>
  );
}
