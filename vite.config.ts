import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add a plugin to handle the os module
    {
      name: "vite:os-module",
      enforce: "pre",
      resolveId(id) {
        if (id === "os") {
          return "\0virtual:os";
        }
      },
      load(id) {
        if (id === "\0virtual:os") {
          return `
            export const homedir = () => '/home/user';
            export const tmpdir = () => '/tmp';
            export const platform = () => 'browser';
            export const EOL = '\\n';
          `;
        }
      },
    },
  ],
  optimizeDeps: {
    include: ["@ant-design/icons", "@ant-design/cssinjs"],
  },
  resolve: {
    alias: {
      // Properly handle the os module by using a node polyfill
      os: "node:os",
    },
  },
  // Strip all console.* calls and debugger statements in production builds
  esbuild: mode === "production" ? { drop: ["console", "debugger"] } : {},
  build: {
    rollupOptions: {
      external: ["os"],
    },
  },
}));
