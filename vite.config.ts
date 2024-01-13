import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { exec } from "node:child_process";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "build-parser",
      watchChange(id) {
        if (id.indexOf("tolgee.grammar") !== -1) {
          exec("npm run --silent grammar", (_, stdout, stderr) => {
            if (stdout) {
              process.stdout.write(stdout);
            }
            if (stderr) {
              process.stderr.write(stderr);
            }
          });
        }
      },
    },
  ],
});
