import argparse
import time

from fantasy_ingestion import player_cache, sleeper_client, storage
from fantasy_ingestion.config import SLEEPER_DRAFT_ID, SLEEPER_LEAGUE_ID

DEFAULT_INTERVAL_SECONDS = 30


def resolve_pick(pick: dict, players: dict) -> dict:
    player = players.get(pick["player_id"], {})
    first_name = player.get("first_name", "")
    last_name = player.get("last_name", "")
    full_name = player.get("full_name") or f"{first_name} {last_name}".strip()

    return {
        "league_id": SLEEPER_LEAGUE_ID,
        "draft_id": SLEEPER_DRAFT_ID,
        "pick_no": pick["pick_no"],
        "round": pick["round"],
        "draft_slot": pick["draft_slot"],
        "roster_id": pick["roster_id"],
        "picked_by": pick["picked_by"],
        "is_keeper": pick["is_keeper"],
        "player_id": pick["player_id"],
        "player_name": full_name or None,
        "position": player.get("position"),
        "team": player.get("team"),
    }


def poll_once(seen_pick_nos: set[int]) -> set[int]:
    players = player_cache.load_players()
    picks = sleeper_client.get_draft_picks(SLEEPER_DRAFT_ID)

    new_pick_nos = set()
    for pick in picks:
        if pick["pick_no"] in seen_pick_nos:
            continue
        resolved = resolve_pick(pick, players)
        storage.put_draft_pick(resolved)
        new_pick_nos.add(pick["pick_no"])
        print(
            f"Pick {resolved['pick_no']:>3} (R{resolved['round']}) "
            f"-> {resolved['player_name']} ({resolved['position']}, {resolved['team']}) "
            f"roster {resolved['roster_id']}"
        )

    return seen_pick_nos | new_pick_nos


def main() -> None:
    parser = argparse.ArgumentParser(description="Poll Sleeper draft picks into DynamoDB")
    parser.add_argument(
        "--watch",
        action="store_true",
        help="Keep polling until the draft is complete instead of running once",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=DEFAULT_INTERVAL_SECONDS,
        help=f"Seconds between polls in --watch mode (default: {DEFAULT_INTERVAL_SECONDS})",
    )
    args = parser.parse_args()

    seen_pick_nos: set[int] = set()
    seen_pick_nos = poll_once(seen_pick_nos)

    if not args.watch:
        return

    while True:
        draft = sleeper_client.get_draft(SLEEPER_DRAFT_ID)
        if draft["status"] == "complete":
            print("Draft complete.")
            break
        time.sleep(args.interval)
        seen_pick_nos = poll_once(seen_pick_nos)


if __name__ == "__main__":
    main()
