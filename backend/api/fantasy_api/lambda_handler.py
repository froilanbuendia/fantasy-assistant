import json
from decimal import Decimal

from fantasy_api import storage
from fantasy_api.config import SLEEPER_DRAFT_ID, SLEEPER_LEAGUE_ID


def _json_default(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def handler(event, context):
    picks = storage.get_draft_picks(SLEEPER_LEAGUE_ID, SLEEPER_DRAFT_ID)
    teams = storage.get_teams(SLEEPER_LEAGUE_ID)
    slot_to_roster_id = storage.get_draft_slots(SLEEPER_LEAGUE_ID, SLEEPER_DRAFT_ID)

    # league_id/draft_id are identical on every pick (this endpoint only ever
    # serves one draft) — lift them out once instead of repeating per pick.
    picks = [{k: v for k, v in pick.items() if k not in ("league_id", "draft_id")} for pick in picks]
    teams = [{k: v for k, v in team.items() if k != "league_id"} for team in teams]

    body = {
        "league_id": SLEEPER_LEAGUE_ID,
        "draft_id": SLEEPER_DRAFT_ID,
        "teams": teams,
        "picks": picks,
        "slot_to_roster_id": slot_to_roster_id,
    }

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body, default=_json_default),
    }
