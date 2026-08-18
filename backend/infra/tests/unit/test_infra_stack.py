import aws_cdk as core
import aws_cdk.assertions as assertions

from infra.draft_poller_stack import DraftPollerStack


def test_draft_poller_resources_created():
    app = core.App()
    stack = DraftPollerStack(app, "test-stack")
    template = assertions.Template.from_stack(stack)

    template.resource_count_is("AWS::Lambda::Function", 1)
    template.has_resource_properties(
        "AWS::Events::Rule", {"ScheduleExpression": "rate(15 minutes)"}
    )
