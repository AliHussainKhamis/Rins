import { fileURLToPath } from "node:url";

export default {
  plugins: {
    // Resolve the Tailwind config relative to this file, not the cwd,
    // so the custom theme loads no matter where the dev server is started.
    tailwindcss: {
      config: fileURLToPath(new URL("./tailwind.config.js", import.meta.url)),
    },
    autoprefixer: {},
  },
};
