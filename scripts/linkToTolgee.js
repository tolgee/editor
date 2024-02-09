import { rmSync, symlinkSync } from "fs";
import { join, relative, resolve } from "path";

// connects to tolgee platform, so it can be used locally
// use `npm run build:watch` for development

// eslint-disable-next-line no-undef
const TOLGEE_PATH = process.env.TOLGEE_DIR || "../server";

{
  // link webapp to this package
  const target = ".";
  const locationDir = join(TOLGEE_PATH, "webapp/node_modules/@tginternal");
  const location = join(locationDir, "editor");

  rmSync(location, { recursive: true, force: true });
  symlinkSync(relative(locationDir, target), location);
  console.log('linked', resolve(location), '->', resolve(target))
}
