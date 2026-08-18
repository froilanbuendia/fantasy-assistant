from fantasy_ingestion import storage


class _FakeTable:
    def __init__(self, responses):
        self._responses = list(responses)
        self.queries = []

    def query(self, **kwargs):
        self.queries.append(kwargs)
        return self._responses.pop(0)


def test_get_existing_pick_nos_paginates_through_all_pages(monkeypatch):
    fake_table = _FakeTable(
        [
            {"Items": [{"pick_no": "1"}, {"pick_no": "2"}], "LastEvaluatedKey": {"PK": "x", "SK": "y"}},
            {"Items": [{"pick_no": "3"}]},
        ]
    )
    monkeypatch.setattr(storage, "_get_table", lambda: fake_table)

    result = storage.get_existing_pick_nos("league1", "draft1")

    assert result == {1, 2, 3}
    assert len(fake_table.queries) == 2
    assert "ExclusiveStartKey" not in fake_table.queries[0]
    assert fake_table.queries[1]["ExclusiveStartKey"] == {"PK": "x", "SK": "y"}


def test_get_existing_pick_nos_empty_when_no_picks_stored(monkeypatch):
    fake_table = _FakeTable([{"Items": []}])
    monkeypatch.setattr(storage, "_get_table", lambda: fake_table)

    result = storage.get_existing_pick_nos("league1", "draft1")

    assert result == set()
