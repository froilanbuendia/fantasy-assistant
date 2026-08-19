import json
from decimal import Decimal

import pytest

from fantasy_api import lambda_handler, storage
from fantasy_api.config import SLEEPER_DRAFT_ID, SLEEPER_LEAGUE_ID


def test_json_default_converts_whole_decimal_to_int():
    result = lambda_handler._json_default(Decimal("3"))
    assert result == 3
    assert isinstance(result, int)


def test_json_default_converts_fractional_decimal_to_float():
    result = lambda_handler._json_default(Decimal("3.5"))
    assert result == 3.5
    assert isinstance(result, float)


def test_json_default_raises_for_unsupported_type():
    with pytest.raises(TypeError):
        lambda_handler._json_default(object())


def test_handler_returns_200_with_json_content_type(monkeypatch):
    monkeypatch.setattr(storage, "get_draft_picks", lambda league_id, draft_id: [])
    monkeypatch.setattr(storage, "get_teams", lambda league_id: [])

    response = lambda_handler.handler({}, None)

    assert response["statusCode"] == 200
    assert response["headers"]["Content-Type"] == "application/json"


def test_handler_lifts_league_and_draft_id_out_of_picks(monkeypatch):
    monkeypatch.setattr(
        storage,
        "get_draft_picks",
        lambda league_id, draft_id: [
            {"league_id": league_id, "draft_id": draft_id, "pick_no": 1, "player_name": "Josh Allen"}
        ],
    )
    monkeypatch.setattr(storage, "get_teams", lambda league_id: [])

    body = json.loads(lambda_handler.handler({}, None)["body"])

    assert body["league_id"] == SLEEPER_LEAGUE_ID
    assert body["draft_id"] == SLEEPER_DRAFT_ID
    assert body["picks"] == [{"pick_no": 1, "player_name": "Josh Allen"}]


def test_handler_lifts_league_id_out_of_teams(monkeypatch):
    monkeypatch.setattr(storage, "get_draft_picks", lambda league_id, draft_id: [])
    monkeypatch.setattr(
        storage,
        "get_teams",
        lambda league_id: [{"league_id": league_id, "roster_id": 1, "display_name": "froilan"}],
    )

    body = json.loads(lambda_handler.handler({}, None)["body"])

    assert body["teams"] == [{"roster_id": 1, "display_name": "froilan"}]


def test_handler_serializes_decimal_pick_fields(monkeypatch):
    monkeypatch.setattr(
        storage,
        "get_draft_picks",
        lambda league_id, draft_id: [{"league_id": league_id, "draft_id": draft_id, "pick_no": Decimal("1")}],
    )
    monkeypatch.setattr(storage, "get_teams", lambda league_id: [])

    body = json.loads(lambda_handler.handler({}, None)["body"])

    assert body["picks"] == [{"pick_no": 1}]
