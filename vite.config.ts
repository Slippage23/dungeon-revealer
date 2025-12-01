import { defineConfig } from "vite";
import macrosPlugin from "vite-plugin-babel-macros";
import reactRefresh from "@vitejs/plugin-react-refresh";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), macrosPlugin()],

  server: {
    host: "0.0.0.0",
    port: 4000,
    proxy: {
      "/api/socket.io": { target: "ws://127.0.0.1:3000", ws: true },
      "/api": "http://127.0.0.1:3000",
      "/files": "http://127.0.0.1:3000",
    },
  },
  optimizeDeps: {
    exclude: ["react-spring", "@react-spring/web", "@react-spring/three"],
  },
  build: {
    outDir: "build",
  },
});
