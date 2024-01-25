import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { exec } from "node:child_process";
import { resolve } from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/tolgee-editor.ts"),
      fileName: "tolgee-editor",
      name: "@tolgee/editor",
    },
    rollupOptions: {},
  },
  plugins: [
    react(),
    {
      name: "build-parser",
      watchChange(id) {
        if (id.indexOf("tolgee.grammar") !== -1) {
          exec("npm run --silent grammar", (_, stdout, stderr) => {
            if (stdout) {
              process.stdout.write(stdout);
              process.stdout.write("\n");
            }
            if (stderr) {
              process.stderr.write(stderr);
              process.stderr.write("\n");
            }
          });
        }
      },
    },
  ],
});
