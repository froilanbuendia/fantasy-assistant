from fantasy_ingestion import sync_teams


def test_resolve_teams_joins_roster_owner_to_user():
    rosters = [{"roster_id": 1, "owner_id": "user1"}]
    users = [
        {
            "user_id": "user1",
            "display_name": "froilan",
            "avatar": "abc123",
            "metadata": {"team_name": "The Buendia Blitz"},
        }
    ]

    teams = sync_teams.resolve_teams(rosters, users)

    assert teams == [
        {
            "league_id": sync_teams.SLEEPER_LEAGUE_ID,
            "roster_id": 1,
            "owner_user_id": "user1",
            "display_name": "froilan",
            "team_name": "The Buendia Blitz",
            "avatar_url": "https://sleepercdn.com/avatars/thumbs/abc123",
        }
    ]


def test_resolve_teams_handles_missing_team_name_and_avatar():
    rosters = [{"roster_id": 2, "owner_id": "user2"}]
    users = [{"user_id": "user2", "display_name": "someone", "avatar": None, "metadata": None}]

    teams = sync_teams.resolve_teams(rosters, users)

    assert teams[0]["team_name"] is None
    assert teams[0]["avatar_url"] is None


def test_resolve_teams_normalizes_empty_strings_to_none():
    rosters = [{"roster_id": 4, "owner_id": "user4"}]
    users = [{"user_id": "user4", "display_name": "", "avatar": None, "metadata": {"team_name": ""}}]

    teams = sync_teams.resolve_teams(rosters, users)

    assert teams[0]["display_name"] is None
    assert teams[0]["team_name"] is None


def test_resolve_teams_handles_roster_with_no_owner():
    rosters = [{"roster_id": 3, "owner_id": None}]

    teams = sync_teams.resolve_teams(rosters, users=[])

    assert teams[0]["owner_user_id"] is None
    assert teams[0]["display_name"] is None
    assert teams[0]["team_name"] is None
    assert teams[0]["avatar_url"] is None
