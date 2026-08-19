import os

# fantasy_api.config reads these at import time; there's no .env here since
# this package only ever runs as a Lambda, where CDK sets them directly.
os.environ.setdefault("SLEEPER_LEAGUE_ID", "test-league")
os.environ.setdefault("SLEEPER_DRAFT_ID", "test-draft")
