from fantasy_ingestion import player_cache, poll_draft, sleeper_client, storage

BASE_PICK = {
    "pick_no": 1,
    "round": 1,
    "draft_slot": 1,
    "roster_id": 1,
    "picked_by": "user1",
    "is_keeper": None,
    "player_id": "100",
}


def test_resolve_pick_prefers_full_name():
    players = {
        "100": {
            "full_name": "Josh Allen",
            "first_name": "Josh",
            "last_name": "Allen",
            "position": "QB",
            "team": "BUF",
        }
    }

    resolved = poll_draft.resolve_pick(BASE_PICK, players)

    assert resolved["player_name"] == "Josh Allen"
    assert resolved["position"] == "QB"
    assert resolved["team"] == "BUF"


def test_resolve_pick_falls_back_to_first_last_name_when_full_name_missing():
    players = {"100": {"first_name": "Josh", "last_name": "Allen", "position": "QB", "team": "BUF"}}

    resolved = poll_draft.resolve_pick(BASE_PICK, players)

    assert resolved["player_name"] == "Josh Allen"


def test_resolve_pick_returns_none_name_for_unknown_player():
    resolved = poll_draft.resolve_pick(BASE_PICK, players={})

    assert resolved["player_name"] is None
    assert resolved["position"] is None
    assert resolved["team"] is None


def test_poll_once_writes_only_unseen_picks(monkeypatch):
    monkeypatch.setattr(
        player_cache,
        "load_players",
        lambda: {"100": {"full_name": "Josh Allen", "position": "QB", "team": "BUF"}},
    )
    picks = [
        {**BASE_PICK, "pick_no": 1},
        {**BASE_PICK, "pick_no": 2},
    ]
    monkeypatch.setattr(sleeper_client, "get_draft_picks", lambda draft_id: picks)

    written = []
    monkeypatch.setattr(storage, "put_draft_pick", lambda pick: written.append(pick["pick_no"]))

    result = poll_draft.poll_once(seen_pick_nos={1})

    assert result == {1, 2}
    assert written == [2]
