import os

SLEEPER_LEAGUE_ID = os.environ["SLEEPER_LEAGUE_ID"]
SLEEPER_DRAFT_ID = os.environ["SLEEPER_DRAFT_ID"]

DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "fantasy-dashboard")
AWS_REGION = os.environ.get("AWS_REGION", "us-west-2")
