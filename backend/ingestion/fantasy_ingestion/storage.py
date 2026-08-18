import boto3

from fantasy_ingestion.config import AWS_REGION, DYNAMODB_TABLE

_table = None


def _get_table():
    global _table
    if _table is None:
        _table = boto3.resource("dynamodb", region_name=AWS_REGION).Table(DYNAMODB_TABLE)
    return _table


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
