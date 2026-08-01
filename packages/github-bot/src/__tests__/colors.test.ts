import { getHexColor, Colors } from "../utils/colors";

describe("Colors", () => {
  it("returns the correct hex color for a known key", () => {
    expect(getHexColor("Opened")).toBe(0x2ecc71);
    expect(getHexColor("Assigned")).toBe(0x3498db);
    expect(getHexColor("Merged")).toBe(0x2ecc71);
  });

  it("returns Default for an unknown key", () => {
    expect(getHexColor("NonExistent" as any)).toBe(Colors.Default);
  });

  it("has FirstContribution defined", () => {
    expect(Colors.FirstContribution).toBe(0xf1c40f);
  });
});
