import { rmSync, symlinkSync } from "fs";
import { join, relative, resolve } from "path";

// connects to tolgee platform, so it can be used locally
// use `npm run build:watch` for development

// eslint-disable-next-line no-undef
const TOLGEE_PATH = process.env.TOLGEE_DIR || "../server/webapp";

{
  // link webapp to this package
  const target = ".";
  const location = join(TOLGEE_PATH, "node_modules/@tginternal/editor");
  const locationDir = join(location, "..");

  rmSync(location, { recursive: true, force: true });
  symlinkSync(relative(locationDir, target), location);
  console.log('linked', resolve(location), '->', resolve(target))
}

// link shared codemirror packages, to avoid duplicate classes
function backLink(packageName) {
  const target = join(TOLGEE_PATH, "node_modules", packageName);
  const location = join(".", "node_modules", packageName);
  const locationDir = join(location, "..");
  
  rmSync(location, { recursive: true, force: true });
  symlinkSync(relative(locationDir, target), location);
  console.log('linked', resolve(location), '->', resolve(target))
}

backLink("@codemirror/state")
backLink("@codemirror/view")
backLink("@codemirror/language")
backLink("@lezer/highlight")
backLink("@lezer/lr")
