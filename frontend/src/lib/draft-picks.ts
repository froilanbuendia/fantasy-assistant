export type DraftPick = {
  pick_no: number;
  round: number;
  draft_slot: number;
  roster_id: number;
  picked_by: string;
  is_keeper: boolean | null;
  player_id: string;
  player_name: string | null;
  position: string | null;
  team: string | null;
};

export type Team = {
  roster_id: number;
  owner_user_id: string | null;
  display_name: string | null;
  team_name: string | null;
  avatar_url: string | null;
};

export type DraftPicksResponse = {
  league_id: string;
  draft_id: string;
  teams: Team[];
  picks: DraftPick[];
  // Fixed slot->roster_id mapping from the draft object, unaffected by pick
  // trades. Keys are slot numbers as strings (Sleeper's own JSON shape).
  slot_to_roster_id: Record<string, number>;
};

export async function getDraftPicks(): Promise<DraftPicksResponse> {
  const url = process.env.NEXT_PUBLIC_DRAFT_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_DRAFT_API_URL is not set");
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Draft picks request failed: ${res.status}`);
  }

  return res.json();
}
