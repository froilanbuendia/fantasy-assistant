import { describe, expect, it } from "vitest";
import { playerImageUrl } from "@/lib/player-image";

describe("playerImageUrl", () => {
  it("builds a Sleeper CDN thumbnail URL from the player id", () => {
    expect(playerImageUrl("4984")).toBe("https://sleepercdn.com/content/nfl/players/thumb/4984.jpg");
  });

  it("returns null for an empty player id", () => {
    expect(playerImageUrl("")).toBeNull();
  });
});
