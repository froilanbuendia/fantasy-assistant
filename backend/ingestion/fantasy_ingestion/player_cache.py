import json
import time

from fantasy_ingestion import sleeper_client
from fantasy_ingestion.config import CACHE_DIR, PLAYERS_CACHE_PATH

MAX_AGE_SECONDS = 24 * 60 * 60


def load_players(force_refresh: bool = False) -> dict:
    if not force_refresh and PLAYERS_CACHE_PATH.exists():
        age = time.time() - PLAYERS_CACHE_PATH.stat().st_mtime
        if age < MAX_AGE_SECONDS:
            return json.loads(PLAYERS_CACHE_PATH.read_text())

    players = sleeper_client.get_all_players()
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    PLAYERS_CACHE_PATH.write_text(json.dumps(players))
    return players
