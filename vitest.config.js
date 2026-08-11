import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({ include: "**/*.{jsx,js}" })],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
