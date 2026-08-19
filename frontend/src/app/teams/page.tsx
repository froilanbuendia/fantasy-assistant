"use client";

import { useState } from "react";
import { useDraftPicks } from "@/lib/use-draft-picks";
import { teamLabel } from "@/lib/team-label";
import { playerImageUrl } from "@/lib/player-image";
import { positionColorClass } from "@/lib/position-colors";
import { groupByRosterId, groupByPosition } from "@/lib/group-picks";
import { Avatar } from "@/components/avatar";

export default function Teams() {
  const { picks, teams, error, lastUpdated } = useDraftPicks();
  const picksByRoster = picks ? groupByRosterId(picks) : null;
  const [selectedRosterId, setSelectedRosterId] = useState<number | "all">("all");

  const visibleTeams =
    teams === null ? null : selectedRosterId === "all" ? teams : teams.filter((team) => team.roster_id === selectedRosterId);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Teams
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading…"} · Grouped
            by drafted position, not an assigned starting lineup — the draft alone doesn&apos;t say
            who each manager will start.
          </p>
          {teams !== null && teams.length > 0 && (
            <select
              value={selectedRosterId}
              onChange={(e) =>
                setSelectedRosterId(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="w-fit rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            >
              <option value="all">All teams</option>
              {teams.map((team) => (
                <option key={team.roster_id} value={team.roster_id}>
                  {teamLabel(team, team.roster_id)}
                </option>
              ))}
            </select>
          )}
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

        {visibleTeams !== null && picksByRoster !== null && visibleTeams.length > 0 && (
          <div
            className={
              selectedRosterId === "all"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "grid max-w-md grid-cols-1 gap-4"
            }
          >
            {visibleTeams.map((team) => {
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
                          <p className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            <span
                              className={`h-2.5 w-2.5 rounded-sm border-l-2 ${positionColorClass(position === "Unknown" ? null : position)}`}
                            />
                            {position}
                          </p>
                          {positionPicks.length > 0 && (
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
                          )}
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
