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

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"picks": picks}, default=_json_default),
    }
