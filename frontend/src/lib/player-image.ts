// Sleeper serves player headshots by ID with no lookup needed, but doesn't
// guarantee every player_id has one — callers should treat a failed image
// load as "no photo", not an error (see Avatar's onError fallback).
export function playerImageUrl(playerId: string): string | null {
  return playerId ? `https://sleepercdn.com/content/nfl/players/thumb/${playerId}.jpg` : null;
}
