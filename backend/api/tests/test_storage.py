from fantasy_api import storage


class _FakeTable:
    def __init__(self, responses):
        self._responses = list(responses)
        self.queries = []

    def query(self, **kwargs):
        self.queries.append(kwargs)
        return self._responses.pop(0)


def test_get_draft_picks_paginates_through_all_pages(monkeypatch):
    fake_table = _FakeTable(
        [
            {"Items": [{"pick_no": 1}], "LastEvaluatedKey": {"PK": "x", "SK": "y"}},
            {"Items": [{"pick_no": 2}]},
        ]
    )
    monkeypatch.setattr(storage, "_get_table", lambda: fake_table)

    result = storage.get_draft_picks("league1", "draft1")

    assert [item["pick_no"] for item in result] == [1, 2]
    assert len(fake_table.queries) == 2
    assert "ExclusiveStartKey" not in fake_table.queries[0]
    assert fake_table.queries[1]["ExclusiveStartKey"] == {"PK": "x", "SK": "y"}


def test_get_draft_picks_strips_internal_keys(monkeypatch):
    fake_table = _FakeTable(
        [
            {
                "Items": [
                    {
                        "PK": "LEAGUE#league1",
                        "SK": "DRAFT#draft1#PICK#0001",
                        "GSI1PK": "POSITION#QB",
                        "GSI1SK": "DRAFT#draft1#PICK#0001",
                        "GSI2PK": "OWNER#1",
                        "GSI2SK": "DRAFT#draft1#PICK#0001",
                        "pick_no": 1,
                        "player_name": "Josh Allen",
                    }
                ]
            }
        ]
    )
    monkeypatch.setattr(storage, "_get_table", lambda: fake_table)

    result = storage.get_draft_picks("league1", "draft1")

    assert result == [{"pick_no": 1, "player_name": "Josh Allen"}]


def test_get_draft_picks_empty_when_no_picks_stored(monkeypatch):
    fake_table = _FakeTable([{"Items": []}])
    monkeypatch.setattr(storage, "_get_table", lambda: fake_table)

    result = storage.get_draft_picks("league1", "draft1")

    assert result == []


def test_get_teams_paginates_through_all_pages(monkeypatch):
    fake_table = _FakeTable(
        [
            {"Items": [{"roster_id": 1}], "LastEvaluatedKey": {"PK": "x", "SK": "y"}},
            {"Items": [{"roster_id": 2}]},
        ]
    )
    monkeypatch.setattr(storage, "_get_table", lambda: fake_table)

    result = storage.get_teams("league1")

    assert [team["roster_id"] for team in result] == [1, 2]
    assert len(fake_table.queries) == 2


def test_get_teams_strips_internal_keys(monkeypatch):
    fake_table = _FakeTable(
        [
            {
                "Items": [
                    {
                        "PK": "LEAGUE#league1",
                        "SK": "TEAM#0001#META",
                        "roster_id": 1,
                        "display_name": "froilan",
                    }
                ]
            }
        ]
    )
    monkeypatch.setattr(storage, "_get_table", lambda: fake_table)

    result = storage.get_teams("league1")

    assert result == [{"roster_id": 1, "display_name": "froilan"}]
