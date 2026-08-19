import requests

from fantasy_ingestion.config import SLEEPER_API_BASE


def _get(path: str) -> dict | list:
    response = requests.get(f"{SLEEPER_API_BASE}{path}", timeout=10)
    response.raise_for_status()
    return response.json()


def get_draft(draft_id: str) -> dict:
    return _get(f"/draft/{draft_id}")


def get_draft_picks(draft_id: str) -> list[dict]:
    return _get(f"/draft/{draft_id}/picks")


def get_league(league_id: str) -> dict:
    return _get(f"/league/{league_id}")


def get_league_users(league_id: str) -> list[dict]:
    return _get(f"/league/{league_id}/users")


def get_league_rosters(league_id: str) -> list[dict]:
    return _get(f"/league/{league_id}/rosters")


def get_all_players() -> dict:
    return _get("/players/nfl")
