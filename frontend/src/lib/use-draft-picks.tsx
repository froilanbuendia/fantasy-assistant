"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getDraftPicks, type DraftPick, type Team } from "@/lib/draft-picks";

const POLL_INTERVAL_MS = 30_000;

type DraftPicksState = {
  picks: DraftPick[] | null;
  teams: Team[] | null;
  slotToRosterId: Record<string, number> | null;
  leagueName: string | null;
  error: string | null;
  lastUpdated: Date | null;
};

const DraftPicksContext = createContext<DraftPicksState | null>(null);

// Polls once here, at the layout level — living above both routed pages
// means it isn't unmounted (and doesn't restart from "loading") every time
// the user switches between Draft Board and Teams.
export function DraftPicksProvider({ children }: { children: ReactNode }) {
  const [picks, setPicks] = useState<DraftPick[] | null>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [slotToRosterId, setSlotToRosterId] = useState<Record<string, number> | null>(null);
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getDraftPicks();
        if (cancelled) return;
        // A response could theoretically omit fields (e.g. a stale deploy)
        // despite the TS type — fall back so callers only ever see
        // "loading" (null) or the real value, never undefined.
        setPicks(data.picks ?? []);
        setTeams(data.teams ?? []);
        setSlotToRosterId(data.slot_to_roster_id ?? {});
        setLeagueName(data.league_name ?? null);
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load draft picks");
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <DraftPicksContext.Provider value={{ picks, teams, slotToRosterId, leagueName, error, lastUpdated }}>
      {children}
    </DraftPicksContext.Provider>
  );
}

export function useDraftPicks(): DraftPicksState {
  const context = useContext(DraftPicksContext);
  if (!context) {
    throw new Error("useDraftPicks must be used within a DraftPicksProvider");
  }
  return context;
}
