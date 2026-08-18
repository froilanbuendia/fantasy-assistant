# Fantasy Dashboard — Project Context

## Repo layout

```
fantasy-dashboard/
├── CLAUDE.md
├── backend/
│   ├── ingestion/     # Sleeper API calls + DynamoDB writes; also the Lambda's own code (Phase 1a, deployed)
│   ├── api/            # Lambda handlers serving data to the frontend (later)
│   └── infra/           # CDK stack — Lambda + EventBridge schedule, deployed (Phase 1a)
└── frontend/              # Next.js app (later, not yet scaffolded)
```

## Commands

`backend/ingestion/` is a [uv](https://docs.astral.sh/uv/) project (Python 3.12), **flat
package layout** (`fantasy_ingestion/` at the project root, not `src/`) — this is required
so `backend/infra`'s CDK `PythonFunction` construct can bundle it directly for Lambda (see
`[tool.uv.build-backend] module-root = ""` in its `pyproject.toml`). Don't reintroduce a
`src/` layout here without updating the CDK stack's `index` path to match.

```
cd backend/ingestion
uv sync                 # install deps
uv run poll-draft        # poll the draft once, resolve picks, write to DynamoDB
uv run poll-draft --watch                  # keep polling until draft status == complete
uv run poll-draft --watch --interval 60    # override the default 30s poll interval
```

Config is read from `backend/ingestion/.env` (`SLEEPER_LEAGUE_ID`, `SLEEPER_DRAFT_ID`,
`DYNAMODB_TABLE`, `AWS_REGION`) — see `.env.example`. AWS credentials come from the
ambient AWS CLI/SSO config (account `389050373429`, region `us-west-2`); there's no
in-repo credential handling.

`backend/infra/` is a CDK v2 Python app (stack: `FantasyDashboardDraftPollerStack`).
Deploying requires Docker running locally (the `PythonFunction` construct bundles
`backend/ingestion`'s deps via a Lambda-compatible Docker container).

```
cd backend/infra
source .venv/bin/activate   # or: python -m venv .venv && pip install -r requirements.txt -r requirements-dev.txt
cdk diff                    # preview changes against the deployed stack
cdk deploy                  # deploy (creates/updates real AWS resources)
python -m pytest tests/     # unit tests (assert on synthesized CloudFormation)
```

The stack is **already deployed**: an EventBridge rule invokes the `DraftPollFunction`
Lambda (entry: `fantasy_ingestion/lambda_handler.py`) every 15 minutes to poll the live
draft and write picks to DynamoDB. It reads/writes an *existing* `fantasy-dashboard`
table via `Table.from_table_name` — the stack does not own or manage that table's
lifecycle (created manually via AWS CLI), so `cdk destroy` cannot delete the data.
`SLEEPER_LEAGUE_ID`/`SLEEPER_DRAFT_ID` are hardcoded as constants at the top of
`backend/infra/infra/draft_poller_stack.py` (update there, not via `.env`, for anything
that runs in Lambda). The Lambda's player-cache file lives in `/tmp` (`CACHE_DIR` env
var), since `/var/task` is read-only.

## Overview

Personal web app to track fantasy football/basketball leagues, surface stats and
win projections, and provide AI-assisted advice (roster moves, trade evaluation,
lineup decisions). Built by Froilan, a full-stack dev (React/Node/AWS) reusing
the architecture pattern from his existing **Roster Fit Analyzer** project
(Python/nba_api → DynamoDB → Lambda → API Gateway → Next.js/Tailwind).

## Leagues in scope

- **Sleeper**: 1 dynasty superflex NFL league (12-team, PPR, keeper + rookie draft)
- **ESPN**: 2 football leagues, 2 basketball leagues (not yet integrated — phase 2)

## Phased build plan

1. **Phase 1a (current, build this first):** Sleeper **draft** ingestion.
   The dynasty league's startup draft is live right now — rosters are empty
   until it completes, but `/draft/{draft_id}/picks` is populated and
   updates pick-by-pick. This is the actual first buildable target:
   - Poll `/draft/{draft_id}/picks` and resolve player_ids against the
     cached `/players/nfl` dictionary
   - Store picks in DynamoDB as they land (good live-data test case)
   - Simple frontend view: live draft board / "my picks so far" — a
     stripped-down version of the dashboard, useful immediately instead of
     waiting for the draft to finish
   - This validates the whole pipeline (ingestion → storage → API → frontend)
     end to end before any roster/season logic exists
   - All ingestion code lives under `backend/ingestion/` (e.g.
     `backend/ingestion/sleeper_client.py`), separate from `backend/api/`
     (data-serving Lambdas) and `backend/infra/` (CDK stack) once those exist
2. **Phase 1b:** Once the draft completes, switch primary polling to
   `/league/{league_id}/rosters` and build out the full season dashboard
   (matchups, projections, trends) described below.
3. **Phase 2:** ESPN ingestion via the unofficial `espn_api` Python package,
   authenticated with personal `espn_s2` / `SWID` session cookies (grabbed
   manually from browser; no OAuth, no browser extension needed since these
   are Froilan's own private leagues, not a multi-user product). Cookies
   expire periodically (~yearly) and need manual refresh.
4. **Phase 3:** Cross-platform normalization layer (map same player across
   Sleeper/ESPN player IDs via name + position + team) so a player can be
   tracked across all rostered leagues in one view.
5. **Phase 4:** LLM advice layer — Claude API with function calling wired to
   the app's own DynamoDB data (tools like `get_my_roster`, `get_matchup_projection`,
   `get_trade_value`) so advice is grounded in real league data, not guesses.

## Architecture (Phase 1 — Sleeper)

### Data ingestion

- Scheduled Lambda (EventBridge trigger) calling Sleeper's public REST API
  (`https://api.sleeper.app/v1`, no auth required).
- **Build order matters here — start with the draft, not the season:**
  1. First: poll `/draft/{draft_id}/picks` (live-updating pick list) — this
     is the only endpoint with real data right now and is the actual v1
     target.
  2. Later: once the draft's `status` field flips from `drafting` to
     `complete`, switch primary polling to `/league/{league_id}/rosters`,
     `/league/{league_id}/matchups/{week}`, `/league/{league_id}/transactions/{round}`
  3. Design the Lambda to branch on that `status` field from the start so
     the same pipeline carries into the season without a rewrite — but the
     first working version only needs to handle the draft branch.
- Cache `/players/nfl` (full player dictionary, ~5MB) locally — refresh **at
  most once per day**, per Sleeper's own docs. This is the one endpoint worth
  being careful about; everything else is small.
- Rate limit: stay under 1000 requests/min/IP (Sleeper's stated limit). A
  personal-scale app polling one league is nowhere close to this ceiling.

### Storage

- DynamoDB, single-table design (same pattern as Roster Fit Analyzer). Table
  `fantasy-dashboard` (us-west-2, on-demand billing) already exists — created
  manually via AWS CLI for Phase 1a rather than through `infra/`, since CDK
  is deferred until Lambda/EventBridge are wired up.
  - PK: `PLAYER#{player_id}` or `TEAM#{roster_id}` or `LEAGUE#{league_id}`
  - SK: `WEEK#{season}#{week}` or `META` for static/current info; draft picks
    use `DRAFT#{draft_id}#PICK#{pick_no:04d}` under `LEAGUE#{league_id}`
  - GSI1 (`GSI1-position`) and GSI2 (`GSI2-owner`) mirror PK/SK as
    `POSITION#{position}` / `OWNER#{roster_id}` for efficient "all my RBs" /
    "all trending players" queries without table scans

### API layer

- API Gateway + Lambda, or a simpler **Lambda Function URL** (given
  personal-scale traffic, this skips API Gateway overhead/config entirely —
  worth defaulting to this unless a custom domain on the API itself is needed).
- Endpoints: `/roster/{team}`, `/matchup/{week}`, `/trade-value/{player_id}`,
  `/league/trends`

### Frontend

- Next.js + Tailwind, matching Froilan's existing portfolio site.
- Views: roster dashboard, weekly matchup/projection, trade analyzer
  (flag when a rostered player is bundled into a pick-heavy trade offer —
  came up as a real scenario during league play).
- Should be a responsive **PWA** (manifest.json + service worker) rather than
  a native mobile app — covers phone use without a second codebase, no App
  Store overhead. Native app only revisited later if push notifications
  become a real need.

### CI/CD

- Reuse existing GitHub Actions + OIDC federation pipeline from the
  portfolio site, pointed at this new CDK stack.

## Explicitly deferred / out of scope for now

- ESPN, Yahoo, or full multi-platform "hub" — confirmed via research that
  even FantasyPros needed a Chrome extension for ESPN specifically (no public
  API there) and per-user OAuth for Yahoo. Not worth building until Sleeper
  v1 is solid, and possibly not worth building at all unless there's a reason
  beyond personal use.
- Full custom ML projection model — start with aggregated/consensus
  projections; revisit a real model (scikit-learn/XGBoost on
  nfl_data_py historical data) as a later phase once the pipeline is proven.

## Reference: Sleeper API endpoints used

```
GET /v1/league/{league_id}
GET /v1/league/{league_id}/users
GET /v1/league/{league_id}/rosters
GET /v1/league/{league_id}/drafts
GET /v1/league/{league_id}/transactions/{round}
GET /v1/league/{league_id}/matchups/{week}
GET /v1/draft/{draft_id}
GET /v1/draft/{draft_id}/picks
GET /v1/draft/{draft_id}/traded_picks
GET /v1/players/nfl              # cache daily, ~5MB
GET /v1/players/nfl/trending/{add|drop}
```

No auth required for any of the above.
