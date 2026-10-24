import { defineConfig } from 'astro/config';
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CACHE = '.cache/og';

/** Deletes cached images that this build didn't use (src/lib/og.ts touches every file it reads or writes). */
function pruneImageCache() {
  let started = 0;
  return {
    name: 'prune-image-cache',
    hooks: {
      'astro:build:start': () => {
        started = Date.now() - 1000;
      },
      'astro:build:done': ({ logger }) => {
        let removed = 0;
        for (const f of readdirSync(CACHE, { withFileTypes: true })) {
          const path = join(CACHE, f.name);
          if (f.isFile() && statSync(path).mtimeMs < started) {
            rmSync(path);
            removed++;
          }
        }
        if (removed) logger.info(`removed ${removed} unused cached images`);
      },
    },
  };
}

export default defineConfig({
  site: 'https://fratipatchatori.it',
  // GitHub Pages redirects /it/12-09 to /it/12-09/: link to the final URL directly.
  trailingSlash: 'always',
  integrations: [pruneImageCache()],
});
