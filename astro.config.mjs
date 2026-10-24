import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://fratipatchatori.it',
  // GitHub Pages redirects /it/12-09 to /it/12-09/: link to the final URL directly.
  trailingSlash: 'always',
});
