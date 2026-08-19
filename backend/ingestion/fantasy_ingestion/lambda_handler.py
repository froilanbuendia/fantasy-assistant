import os

import boto3

from fantasy_ingestion import sleeper_client, storage, sync_teams
from fantasy_ingestion.config import SLEEPER_DRAFT_ID, SLEEPER_LEAGUE_ID
from fantasy_ingestion.poll_draft import poll_once


def _disable_own_schedule() -> None:
    rule_name = os.environ.get("EVENTBRIDGE_RULE_NAME")
    if not rule_name:
        return
    boto3.client("events").disable_rule(Name=rule_name)
    print(f"Disabled EventBridge rule {rule_name} (draft complete).")


def handler(event, context):
    draft = sleeper_client.get_draft(SLEEPER_DRAFT_ID)
    sync_teams.sync_teams()

    slot_to_roster_id = draft.get("slot_to_roster_id")
    if slot_to_roster_id:
        storage.put_draft_slots(SLEEPER_LEAGUE_ID, SLEEPER_DRAFT_ID, slot_to_roster_id)

    if draft["status"] == "complete":
        print("Draft complete, skipping poll. Switch to roster/matchup polling (Phase 1b).")
        _disable_own_schedule()
        return {"status": "complete", "picks_written": 0}

    seen_pick_nos = storage.get_existing_pick_nos(SLEEPER_LEAGUE_ID, SLEEPER_DRAFT_ID)
    updated_pick_nos = poll_once(seen_pick_nos=seen_pick_nos)
    picks_written = len(updated_pick_nos) - len(seen_pick_nos)

    return {"status": draft["status"], "picks_written": picks_written}
