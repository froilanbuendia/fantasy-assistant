from fantasy_ingestion import sleeper_client, storage
from fantasy_ingestion.config import SLEEPER_LEAGUE_ID


def resolve_teams(rosters: list[dict], users: list[dict]) -> list[dict]:
    users_by_id = {user["user_id"]: user for user in users}

    teams = []
    for roster in rosters:
        owner_id = roster.get("owner_id")
        user = users_by_id.get(owner_id, {})
        avatar_id = user.get("avatar")

        teams.append(
            {
                "league_id": SLEEPER_LEAGUE_ID,
                "roster_id": roster["roster_id"],
                "owner_user_id": owner_id,
                "display_name": user.get("display_name"),
                "team_name": (user.get("metadata") or {}).get("team_name"),
                "avatar_url": f"https://sleepercdn.com/avatars/thumbs/{avatar_id}" if avatar_id else None,
            }
        )
    return teams


def sync_teams() -> None:
    rosters = sleeper_client.get_league_rosters(SLEEPER_LEAGUE_ID)
    users = sleeper_client.get_league_users(SLEEPER_LEAGUE_ID)
    for team in resolve_teams(rosters, users):
        storage.put_team(team)
