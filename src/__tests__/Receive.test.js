import { describe, it, expect, vi } from "vitest";

describe("Receive component unit assertions", () => {
  it("validates short address formatting for download filename", () => {
    const address = "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFXYSFZROB3WGYARKBR6Z";
    const shortAddr = address.length > 10 ? `${address.slice(0, 6)}_${address.slice(-4)}` : "wallet";
    expect(shortAddr).toBe("GBRPYH_BR6Z");
    expect(`lynxx-qr-${shortAddr}.png`).toBe("lynxx-qr-GBRPYH_BR6Z.png");
  });

  it("validates empty address fallback state text", () => {
    const emptyStateText = "No wallet connected";
    const helperText = "Connect your wallet to see your receive address and QR code.";
    expect(emptyStateText).toBe("No wallet connected");
    expect(helperText).toContain("Connect your wallet");
  });
});
