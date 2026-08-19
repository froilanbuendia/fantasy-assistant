"use client";

import { useEffect, useState } from "react";
import { getDraftPicks, type DraftPick, type Team } from "@/lib/draft-picks";

const POLL_INTERVAL_MS = 30_000;

export function useDraftPicks() {
  const [picks, setPicks] = useState<DraftPick[] | null>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getDraftPicks();
        if (cancelled) return;
        // A response could theoretically omit picks/teams (e.g. a stale
        // deploy) despite the TS type — fall back to [] so callers only ever
        // see "loading" (null) or a real array, never undefined.
        setPicks(data.picks ?? []);
        setTeams(data.teams ?? []);
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

  return { picks, teams, error, lastUpdated };
}
