import { rmSync, symlinkSync } from "fs";
import { join, relative, resolve } from "path";

// connects to tolgee platform, so it can be used locally
// use `npm run build:watch` for development

// eslint-disable-next-line no-undef
const TOLGEE_PATH = process.env.TOLGEE_DIR || "../server/webapp";

{
  // link webapp to this package
  const target = ".";
  const locationDir = join(TOLGEE_PATH, "node_modules/@tginternal");
  const location = join(locationDir, "editor");

  rmSync(location, { recursive: true, force: true });
  symlinkSync(relative(locationDir, target), location);
  console.log('linked', resolve(location), '->', resolve(target))
}

// link shared codemirror packages, to avoid duplicate classes
{
  const target = join(TOLGEE_PATH, "node_modules/@codemirror/state");
  const locationDir = join(".", "node_modules/@codemirror");
  const location = join(locationDir, "state");

  rmSync(location, { recursive: true, force: true });
  symlinkSync(relative(locationDir, target), location);
  console.log('linked', resolve(location), '->', resolve(target))
}

// link shared codemirror packages, to avoid duplicate classes
{
  const target = join(TOLGEE_PATH, "node_modules/@codemirror/view");
  const locationDir = join(".", "node_modules/@codemirror");
  const location = join(locationDir, "view");

  rmSync(location, { recursive: true, force: true });
  symlinkSync(relative(locationDir, target), location);
  console.log('linked', resolve(location), '->', resolve(target))
}
