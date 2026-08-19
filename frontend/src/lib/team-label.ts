import type { Team } from "@/lib/draft-picks";

export function teamLabel(team: Team | undefined, rosterId: number): string {
  return team?.team_name ?? team?.display_name ?? `Team ${rosterId}`;
}
