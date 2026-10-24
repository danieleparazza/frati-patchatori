import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://danieleparazza.github.io',
  base: '/frati-patchatori',
  // GitHub Pages redirects /it/12-09 to /it/12-09/: link to the final URL directly.
  trailingSlash: 'always',
});
