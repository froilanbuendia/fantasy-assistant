#!/usr/bin/env python3
import os

import aws_cdk as cdk

from infra.draft_api_stack import DraftApiStack
from infra.draft_poller_stack import DraftPollerStack


app = cdk.App()
env = cdk.Environment(
    account=os.getenv("CDK_DEFAULT_ACCOUNT", "389050373429"),
    region=os.getenv("CDK_DEFAULT_REGION", "us-west-2"),
)
DraftPollerStack(app, "FantasyDashboardDraftPollerStack", env=env)
DraftApiStack(app, "FantasyDashboardDraftApiStack", env=env)

app.synth()
