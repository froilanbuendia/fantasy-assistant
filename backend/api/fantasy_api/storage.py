import boto3
from boto3.dynamodb.conditions import Key

from fantasy_api.config import AWS_REGION, DYNAMODB_TABLE

_table = None

# DynamoDB storage plumbing (single-table keys + GSI mirrors) — not part of
# the pick data itself, see fantasy_ingestion.storage.put_draft_pick.
_INTERNAL_KEYS = {"PK", "SK", "GSI1PK", "GSI1SK", "GSI2PK", "GSI2SK"}


def _get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb", region_name=AWS_REGION).Table(DYNAMODB_TABLE)
    return _table


def get_draft_picks(league_id: str, draft_id: str) -> list[dict]:
    """All stored picks for this draft, in ascending pick_no order (the
    zero-padded SK sorts that way already)."""
    table = _get_table()
    query_kwargs = {
        "KeyConditionExpression": Key("PK").eq(f"LEAGUE#{league_id}")
        & Key("SK").begins_with(f"DRAFT#{draft_id}#PICK#"),
    }

    picks: list[dict] = []
    while True:
        response = table.query(**query_kwargs)
        picks.extend(
            {k: v for k, v in item.items() if k not in _INTERNAL_KEYS} for item in response["Items"]
        )
        if "LastEvaluatedKey" not in response:
            return picks
        query_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]


def get_teams(league_id: str) -> list[dict]:
    """All team/manager metadata stored for this league, in ascending
    roster_id order (the zero-padded SK sorts that way already)."""
    table = _get_table()
    query_kwargs = {
        "KeyConditionExpression": Key("PK").eq(f"LEAGUE#{league_id}") & Key("SK").begins_with("TEAM#"),
    }

    teams: list[dict] = []
    while True:
        response = table.query(**query_kwargs)
        teams.extend(
            {k: v for k, v in item.items() if k not in _INTERNAL_KEYS} for item in response["Items"]
        )
        if "LastEvaluatedKey" not in response:
            return teams
        query_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]


def get_draft_slots(league_id: str, draft_id: str) -> dict:
    """Fixed slot->roster_id mapping for this draft (unaffected by pick
    trades — see fantasy_ingestion.storage.put_draft_slots)."""
    table = _get_table()
    response = table.get_item(Key={"PK": f"LEAGUE#{league_id}", "SK": f"DRAFT#{draft_id}#SLOTS"})
    item = response.get("Item")
    return item["slot_to_roster_id"] if item else {}


def get_league_name(league_id: str) -> str | None:
    """This league's display name (from its own META item)."""
    table = _get_table()
    response = table.get_item(Key={"PK": f"LEAGUE#{league_id}", "SK": "META"})
    item = response.get("Item")
    return item["name"] if item else None
