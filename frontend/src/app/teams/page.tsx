"use client";

import { useDraftPicks } from "@/lib/use-draft-picks";
import { slotNoteFor, POSITION_ORDER } from "@/lib/roster-slots";
import { teamLabel } from "@/lib/team-label";
import { playerImageUrl } from "@/lib/player-image";
import { Avatar } from "@/components/avatar";
import type { DraftPick } from "@/lib/draft-picks";

function groupByRosterId(picks: DraftPick[]): Map<number, DraftPick[]> {
  const byRoster = new Map<number, DraftPick[]>();
  for (const pick of picks) {
    const group = byRoster.get(pick.roster_id) ?? [];
    group.push(pick);
    byRoster.set(pick.roster_id, group);
  }
  return byRoster;
}

function groupByPosition(picks: DraftPick[]): Map<string, DraftPick[]> {
  const positions = new Map<string, DraftPick[]>();
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

export default function Teams() {
  const { picks, teams, error, lastUpdated } = useDraftPicks();
  const picksByRoster = picks ? groupByRosterId(picks) : null;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Teams
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading…"} · Grouped
            by drafted position, not an assigned starting lineup — the draft alone doesn&apos;t say
            who each manager will start.
          </p>
        </header>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {(teams === null || picksByRoster === null) && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading teams…</p>
        )}

        {teams !== null && teams.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No teams found.</p>
        )}

        {teams !== null && picksByRoster !== null && teams.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const label = teamLabel(team, team.roster_id);
              const teamPicks = picksByRoster.get(team.roster_id) ?? [];
              return (
                <section
                  key={team.roster_id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2">
                    <Avatar src={team.avatar_url} label={label} />
                    <h2 className="font-medium text-zinc-950 dark:text-zinc-50">{label}</h2>
                  </div>
                  {teamPicks.length === 0 ? (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">No picks yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {[...groupByPosition(teamPicks).entries()].map(([position, positionPicks]) => (
                        <div key={position} className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            {position} · {positionPicks.length} drafted ({slotNoteFor(position)})
                          </p>
                          <ul className="flex flex-col gap-1">
                            {positionPicks.map((pick) => {
                              const playerLabel = pick.player_name ?? "Unknown player";
                              return (
                                <li
                                  key={pick.pick_no}
                                  className="flex items-center gap-2 text-sm text-zinc-950 dark:text-zinc-50"
                                >
                                  <Avatar
                                    src={playerImageUrl(pick.player_id)}
                                    label={playerLabel}
                                    size="sm"
                                  />
                                  <span>
                                    {playerLabel}
                                    {pick.team && (
                                      <span className="text-zinc-500 dark:text-zinc-400">
                                        {" "}
                                        · {pick.team}
                                      </span>
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
