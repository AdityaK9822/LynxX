import confetti from "canvas-confetti";

export const BRAND_COLORS = ["#38bdf8", "#a855f7", "#6366f1", "#22c55e", "#f59e0b"];

/**
 * Trigger confetti celebration burst for successful donations
 */
export const triggerDonationConfetti = (isGoalReached = false) => {
    if (typeof window === "undefined") return;

    if (isGoalReached) {
        // Full-Screen Fireworks burst for Campaign Goal Milestone
        const duration = 2500;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);

            confetti({
                particleCount,
                startVelocity: 30,
                spread: 360,
                origin: { x: Math.random(), y: Math.random() - 0.2 },
                colors: BRAND_COLORS,
                zIndex: 9999,
            });
        }, 250);
    } else {
        // Standard celebratory donation burst
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: BRAND_COLORS,
            zIndex: 9999,
        });
    }
};
