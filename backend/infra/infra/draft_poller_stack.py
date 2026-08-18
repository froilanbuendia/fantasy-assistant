from pathlib import Path

from aws_cdk import Duration, Stack
from aws_cdk import aws_dynamodb as dynamodb
from aws_cdk import aws_events as events
from aws_cdk import aws_events_targets as targets
from aws_cdk import aws_lambda as _lambda
from aws_cdk import aws_lambda_python_alpha as python
from constructs import Construct

INGESTION_DIR = Path(__file__).resolve().parent.parent.parent / "ingestion"

DYNAMODB_TABLE_NAME = "fantasy-dashboard"
SLEEPER_LEAGUE_ID = "1382277930977091584"
SLEEPER_DRAFT_ID = "1382277932034039808"


class DraftPollerStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        table = dynamodb.Table.from_table_name(self, "FantasyDashboardTable", DYNAMODB_TABLE_NAME)

        poll_fn = python.PythonFunction(
            self,
            "DraftPollFunction",
            entry=str(INGESTION_DIR),
            index="fantasy_ingestion/lambda_handler.py",
            handler="handler",
            runtime=_lambda.Runtime.PYTHON_3_12,
            timeout=Duration.seconds(30),
            memory_size=256,
            environment={
                "SLEEPER_LEAGUE_ID": SLEEPER_LEAGUE_ID,
                "SLEEPER_DRAFT_ID": SLEEPER_DRAFT_ID,
                "DYNAMODB_TABLE": DYNAMODB_TABLE_NAME,
                "CACHE_DIR": "/tmp/fantasy-ingestion-cache",
            },
            bundling=python.BundlingOptions(
                asset_excludes=[
                    ".venv",
                    ".cache",
                    "__pycache__",
                    ".env",
                    ".env.example",
                    ".gitignore",
                    ".python-version",
                    "README.md",
                ],
            ),
        )

        table.grant_read_write_data(poll_fn)

        events.Rule(
            self,
            "DraftPollSchedule",
            schedule=events.Schedule.rate(Duration.minutes(15)),
            targets=[targets.LambdaFunction(poll_fn)],
        )
