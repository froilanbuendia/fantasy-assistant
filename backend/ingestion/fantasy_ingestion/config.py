import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

SLEEPER_LEAGUE_ID = os.environ["SLEEPER_LEAGUE_ID"]
SLEEPER_DRAFT_ID = os.environ["SLEEPER_DRAFT_ID"]

SLEEPER_API_BASE = "https://api.sleeper.app/v1"

DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "fantasy-dashboard")
AWS_REGION = os.environ.get("AWS_REGION", "us-west-2")

_default_cache_dir = Path(__file__).resolve().parent.parent / ".cache"
CACHE_DIR = Path(os.environ.get("CACHE_DIR", _default_cache_dir))
PLAYERS_CACHE_PATH = CACHE_DIR / "players_nfl.json"
