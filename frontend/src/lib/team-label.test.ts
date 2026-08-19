import { describe, expect, it } from "vitest";
import { teamLabel } from "@/lib/team-label";
import type { Team } from "@/lib/draft-picks";

const BASE_TEAM: Team = {
  roster_id: 1,
  owner_user_id: "user1",
  display_name: "froilan",
  team_name: "The Buendia Blitz",
  avatar_url: null,
};

describe("teamLabel", () => {
  it("prefers team_name when set", () => {
    expect(teamLabel(BASE_TEAM, 1)).toBe("The Buendia Blitz");
  });

  it("falls back to display_name when team_name is missing", () => {
    expect(teamLabel({ ...BASE_TEAM, team_name: null }, 1)).toBe("froilan");
  });

  it("falls back to Team {rosterId} when the team is undefined", () => {
    expect(teamLabel(undefined, 7)).toBe("Team 7");
  });

  it("falls back to Team {rosterId} when both name fields are missing", () => {
    expect(teamLabel({ ...BASE_TEAM, team_name: null, display_name: null }, 3)).toBe("Team 3");
  });
});
