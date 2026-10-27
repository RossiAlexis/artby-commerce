import {
  cpSync,
  lstatSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";

// sharp's linux binary loads libvips from a sibling of @img/sharp-linux-x64.
// pnpm leaves that sibling as a symlink into the store. File tracing then ships
// either the symlink or the store path, and the serverless function cannot
// dlopen libvips. Replace the symlink with a real copy before tracing.
export function materializeSharpLibvips(root = process.cwd()) {
  const pnpmDir = join(root, "node_modules/.pnpm");
  let entries: string[];
  try {
    entries = readdirSync(pnpmDir);
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.startsWith("@img+sharp-linux-x64@")) continue;
    const link = join(
      pnpmDir,
      entry,
      "node_modules/@img/sharp-libvips-linux-x64",
    );
    const staged = `${link}.real`;
    let stat;
    try {
      stat = lstatSync(link);
    } catch {
      try {
        renameSync(staged, link);
      } catch {
        // Nothing was left half-copied.
      }
      continue;
    }

    if (!stat.isSymbolicLink()) {
      rmSync(staged, { recursive: true, force: true });
      continue;
    }

    rmSync(staged, { recursive: true, force: true });
    cpSync(realpathSync(link), staged, { recursive: true, dereference: true });
    rmSync(link);
    renameSync(staged, link);
  }
}
