from pathlib import Path

from aws_cdk import Duration, Stack
from aws_cdk import aws_dynamodb as dynamodb
from aws_cdk import aws_events as events
from aws_cdk import aws_events_targets as targets
from aws_cdk import aws_iam as iam
from aws_cdk import aws_lambda as _lambda
from aws_cdk import aws_lambda_python_alpha as python
from constructs import Construct

from infra.config import DYNAMODB_TABLE_NAME, SLEEPER_DRAFT_ID, SLEEPER_LEAGUE_ID

INGESTION_DIR = Path(__file__).resolve().parent.parent.parent / "ingestion"

DRAFT_POLL_RULE_NAME = "fantasy-dashboard-draft-poll"


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
            rule_name=DRAFT_POLL_RULE_NAME,
            schedule=events.Schedule.rate(Duration.minutes(15)),
            targets=[targets.LambdaFunction(poll_fn)],
        )

        # Lets the Lambda turn off its own schedule once the draft completes,
        # instead of firing forever as a no-op. Built from a static rule name
        # (not schedule.rule_arn) to avoid a Function <-> Rule dependency
        # cycle: the Rule targets the Function, so the Function's role can't
        # also depend on an attribute of the Rule.
        rule_arn = self.format_arn(service="events", resource="rule", resource_name=DRAFT_POLL_RULE_NAME)
        poll_fn.add_environment("EVENTBRIDGE_RULE_NAME", DRAFT_POLL_RULE_NAME)
        poll_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=["events:DisableRule"],
                resources=[rule_arn],
            )
        )
