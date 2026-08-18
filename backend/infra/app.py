#!/usr/bin/env python3
import os

import aws_cdk as cdk

from infra.draft_poller_stack import DraftPollerStack


app = cdk.App()
DraftPollerStack(
    app,
    "FantasyDashboardDraftPollerStack",
    env=cdk.Environment(
        account=os.getenv("CDK_DEFAULT_ACCOUNT", "389050373429"),
        region=os.getenv("CDK_DEFAULT_REGION", "us-west-2"),
    ),
)

app.synth()
