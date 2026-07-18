import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // onora la porta assegnata dall'ambiente (preview tooling); altrimenti default Vite
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
});
