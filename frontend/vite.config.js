import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/banco-de-horas/",
  server: {
    hmr: {
      overlay: false, // Isso desativa o aviso de erro na tela, mas mantém o funcionamento
    },
  },
});
