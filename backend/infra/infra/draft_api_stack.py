from pathlib import Path

from aws_cdk import Duration, Stack
from aws_cdk import aws_dynamodb as dynamodb
from aws_cdk import aws_lambda as _lambda
from aws_cdk import aws_lambda_python_alpha as python
from constructs import Construct

from infra.config import DYNAMODB_TABLE_NAME, SLEEPER_DRAFT_ID, SLEEPER_LEAGUE_ID

API_DIR = Path(__file__).resolve().parent.parent.parent / "api"


class DraftApiStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        table = dynamodb.Table.from_table_name(self, "FantasyDashboardTable", DYNAMODB_TABLE_NAME)

        picks_fn = python.PythonFunction(
            self,
            "DraftPicksFunction",
            entry=str(API_DIR),
            index="fantasy_api/lambda_handler.py",
            handler="handler",
            runtime=_lambda.Runtime.PYTHON_3_12,
            timeout=Duration.seconds(10),
            memory_size=256,
            environment={
                "SLEEPER_LEAGUE_ID": SLEEPER_LEAGUE_ID,
                "SLEEPER_DRAFT_ID": SLEEPER_DRAFT_ID,
                "DYNAMODB_TABLE": DYNAMODB_TABLE_NAME,
            },
            bundling=python.BundlingOptions(
                asset_excludes=[
                    ".venv",
                    ".cache",
                    "__pycache__",
                    ".gitignore",
                    ".python-version",
                    "README.md",
                ],
            ),
        )

        table.grant_read_data(picks_fn)

        picks_fn.add_function_url(
            auth_type=_lambda.FunctionUrlAuthType.NONE,
            cors=_lambda.FunctionUrlCorsOptions(
                allowed_origins=["*"],
                allowed_methods=[_lambda.HttpMethod.GET],
            ),
        )
