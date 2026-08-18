from fantasy_ingestion import sleeper_client
from fantasy_ingestion.config import SLEEPER_DRAFT_ID
from fantasy_ingestion.poll_draft import poll_once


def handler(event, context):
    draft = sleeper_client.get_draft(SLEEPER_DRAFT_ID)

    if draft["status"] == "complete":
        print("Draft complete, skipping poll. Switch to roster/matchup polling (Phase 1b).")
        return {"status": "complete", "picks_written": 0}

    new_picks = poll_once(seen_pick_nos=set())
    return {"status": draft["status"], "picks_written": len(new_picks)}
