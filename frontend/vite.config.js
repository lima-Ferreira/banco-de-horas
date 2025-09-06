import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/banco-de-horas/", // caminho do repositório no GitHub Pages
});
