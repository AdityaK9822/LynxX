import { describe, it, expect, vi } from "vitest";
import { triggerDonationConfetti, BRAND_COLORS } from "../lib/confettiUtils";
import confetti from "canvas-confetti";

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

describe("Crowdfund Confetti Celebrations", () => {
  it("defines LynxX brand colors for confetti particles", () => {
    expect(BRAND_COLORS).toContain("#38bdf8");
    expect(BRAND_COLORS).toContain("#a855f7");
    expect(BRAND_COLORS).toContain("#6366f1");
  });

  it("triggers standard donation confetti with 150 particles and LynxX brand colors", () => {
    triggerDonationConfetti(false);
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({
        particleCount: 150,
        spread: 70,
        colors: BRAND_COLORS,
      })
    );
  });

  it("triggers fireworks animation when campaign goal is reached", () => {
    vi.useFakeTimers();
    triggerDonationConfetti(true);
    vi.advanceTimersByTime(300);
    expect(confetti).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
