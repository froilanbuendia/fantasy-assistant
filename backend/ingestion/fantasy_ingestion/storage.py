import boto3
from boto3.dynamodb.conditions import Key

from fantasy_ingestion.config import AWS_REGION, DYNAMODB_TABLE

_table = None


def _get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb", region_name=AWS_REGION).Table(DYNAMODB_TABLE)
    return _table


def get_existing_pick_nos(league_id: str, draft_id: str) -> set[int]:
    """Pick numbers already stored for this draft, so callers can skip
    re-writing picks that haven't changed."""
    table = _get_table()
    query_kwargs = {
        "KeyConditionExpression": Key("PK").eq(f"LEAGUE#{league_id}")
        & Key("SK").begins_with(f"DRAFT#{draft_id}#PICK#"),
        "ProjectionExpression": "pick_no",
    }

    pick_nos: set[int] = set()
    while True:
        response = table.query(**query_kwargs)
        pick_nos.update(int(item["pick_no"]) for item in response["Items"])
        if "LastEvaluatedKey" not in response:
            return pick_nos
        query_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]


def put_draft_pick(pick: dict) -> None:
    """Write a resolved draft pick item, keyed for lookup by league/draft and
    by position or owner (roster_id) via GSIs."""
    league_id = pick["league_id"]
    draft_id = pick["draft_id"]
    pick_sk = f"DRAFT#{draft_id}#PICK#{pick['pick_no']:04d}"

    item = {
        "PK": f"LEAGUE#{league_id}",
        "SK": pick_sk,
        "GSI1PK": f"POSITION#{pick['position'] or 'UNKNOWN'}",
        "GSI1SK": pick_sk,
        "GSI2PK": f"OWNER#{pick['roster_id']}",
        "GSI2SK": pick_sk,
        **pick,
    }
    _get_table().put_item(Item=item)


def put_team(team: dict) -> None:
    """Write a resolved team/manager item, stored under the same league
    partition as its draft picks (SK prefix TEAM# instead of DRAFT#)."""
    item = {
        "PK": f"LEAGUE#{team['league_id']}",
        "SK": f"TEAM#{team['roster_id']:04d}#META",
        **team,
    }
    _get_table().put_item(Item=item)
