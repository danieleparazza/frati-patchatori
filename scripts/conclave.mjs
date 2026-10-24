// The Conclave: the community elects the Pope of the year on GitHub Discussions.
//   node scripts/conclave.mjs open   (1 December)  opens "Conclave <year>" with the five top-scoring
//                                                    candidates, one comment each; anyone can propose more.
//   node scripts/conclave.mjs close  (21 December) locks the discussion: voting is over.
//   node scripts/conclave.mjs elect  (31 December) counts the 👍, writes the Pope (and cardinals) into
//                                                    data/popes.json: the white smoke. The workflow commits it.
// Votes are 👍 reactions on top-level comments that name a vulnerability of that year (by site link, id or
// name). Uses GITHUB_TOKEN (discussions: write). State lives in data/conclave.json. Add --dry to print only.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const REPO = { owner: 'danieleparazza', name: 'frati-patchatori' };
const SITE = 'https://fratipatchatori.it';
const mode = process.argv[2];
const dry = process.argv.includes('--dry');
const year = Number(process.argv.find((a) => /^\d{4}$/.test(a)) ?? new Date().getUTCFullYear());

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const writeJson = (p, data) => writeFileSync(join(ROOT, p), JSON.stringify(data, null, 2) + '\n');
const vulns = readJson('src/data/vulns.json');
const popes = readJson('data/popes.json');
const state = readJson('data/conclave.json');

async function gql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

/** Vulnerabilities of the year that can still become Pope (not already a Pope or an Antipope). */
function eligible() {
  const taken = new Set([...popes.years.map((p) => p.pope), ...popes.decades.map((p) => p.pope), ...popes.antipopes.map((p) => p.id)]);
  return vulns.filter((v) => v.date.startsWith(String(year)) && !taken.has(v.id));
}

const saintLinks = (v) => `[${v.name}](${SITE}/it/santo/${v.id}/) · [EN](${SITE}/en/saint/${v.id}/)`;

/** Which candidate a comment is about: a marker, a link to its page, its id or its exact name. */
function candidateOf(body, pool) {
  const marker = body.match(/<!-- candidate:([a-z0-9-]+) -->/);
  if (marker) return pool.find((v) => v.id === marker[1]);
  const link = body.match(/\/(?:santo|saint)\/([a-z0-9-]+)/);
  if (link) return pool.find((v) => v.id === link[1]);
  const text = body.toLowerCase();
  return pool.find((v) => new RegExp(`(^|[^a-z0-9])(${v.id}|${v.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})([^a-z0-9]|$)`).test(text));
}

async function open() {
  if (state.year === year && state.discussion) return console.log(`Conclave ${year} already open: ${state.discussion.url}`);
  const candidates = eligible()
    .sort((a, b) => b.fame - a.fame)
    .slice(0, 5);
  const body = [
    `# 🕯️ Conclave ${year}`,
    '',
    `**Italiano.** È tempo di eleggere il Papa del ${year}: la vulnerabilità che ha segnato l'anno. Qui sotto le cinque candidate col punteggio più alto. **Votate con 👍** sul commento della vostra candidata (un voto per commento, potete votarne più di una). Per proporne un'altra, scrivete un nuovo commento con il link alla sua pagina sul [Lunario](${SITE}/it/): deve essere stata divulgata nel ${year}. Si vota fino al 20 dicembre; la fumata bianca è il 31.`,
    '',
    `**English.** Time to elect the Pope of ${year}: the vulnerability that defined the year. Below are the five top-scoring candidates. **Vote with 👍** on your candidate's comment (one vote per comment, you can back more than one). To propose another, post a new comment with the link to its page on the [Almanac](${SITE}/en/); it must have been disclosed in ${year}. Voting is open until 20 December; white smoke on the 31st.`,
  ].join('\n');
  if (dry) return console.log(body, '\n', candidates.map((v) => v.id));
  const repo = await gql(
    `query($owner:String!,$name:String!){ repository(owner:$owner,name:$name){ id discussionCategories(first:25){ nodes { id slug } } } }`,
    REPO,
  );
  const cats = repo.repository.discussionCategories.nodes;
  const category = cats.find((c) => c.slug === 'conclave') ?? cats.find((c) => c.slug === 'announcements');
  const created = await gql(
    `mutation($repo:ID!,$cat:ID!,$title:String!,$body:String!){ createDiscussion(input:{repositoryId:$repo,categoryId:$cat,title:$title,body:$body}){ discussion { id number url } } }`,
    { repo: repo.repository.id, cat: category.id, title: `🕯️ Conclave ${year}`, body },
  );
  const d = created.createDiscussion.discussion;
  for (const v of candidates) {
    const cves = v.cves.length ? ` · ${v.cves.slice(0, 3).join(', ')}` : '';
    await gql(`mutation($id:ID!,$body:String!){ addDiscussionComment(input:{discussionId:$id,body:$body}){ comment { id } } }`, {
      id: d.id,
      body: `<!-- candidate:${v.id} -->\n### ${v.name}\n${saintLinks(v)}${cves}${v.cvss ? ` · CVSS ${v.cvss}` : ''}${v.kev ? ' · CISA KEV' : ''}`,
    });
  }
  Object.assign(state, { year, status: 'open', discussion: { id: d.id, number: d.number, url: d.url } });
  writeJson('data/conclave.json', state);
  console.log(`opened ${d.url}`);
}

async function close() {
  if (state.year !== year || !state.discussion) throw new Error(`no Conclave open for ${year}`);
  if (dry) return console.log('would lock', state.discussion.url);
  await gql(`mutation($id:ID!){ lockLockable(input:{lockableId:$id, lockReason:RESOLVED}){ clientMutationId } }`, { id: state.discussion.id });
  state.status = 'closed';
  writeJson('data/conclave.json', state);
  console.log('locked');
}

async function elect() {
  if (state.year !== year || !state.discussion) throw new Error(`no Conclave for ${year}`);
  const pool = eligible();
  const votes = new Map();
  let cursor = null;
  do {
    const data = await gql(
      `query($id:ID!,$after:String){ node(id:$id){ ... on Discussion { comments(first:100, after:$after){ pageInfo { hasNextPage endCursor } nodes { body reactionGroups { content reactors { totalCount } } } } } } }`,
      { id: state.discussion.id, after: cursor },
    );
    const { nodes, pageInfo } = data.node.comments;
    for (const c of nodes) {
      const v = candidateOf(c.body, pool);
      if (!v) continue;
      const up = c.reactionGroups.find((g) => g.content === 'THUMBS_UP')?.reactors.totalCount ?? 0;
      votes.set(v.id, (votes.get(v.id) ?? 0) + up);
    }
    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
  } while (cursor);
  const fame = new Map(pool.map((v) => [v.id, v.fame]));
  // Most votes wins; a tie goes to the higher score, as the cardinals would have it.
  const ranking = [...votes.entries()].sort((a, b) => b[1] - a[1] || fame.get(b[0]) - fame.get(a[0]));
  if (!ranking.length) throw new Error('no valid votes');
  const [winner, count] = ranking[0];
  const cardinals = ranking.slice(1, 4).map(([id]) => id);
  const entry = { year, pope: winner, cardinals, why: `Elected by the ${year} Conclave with ${count} ${count === 1 ? 'vote' : 'votes'} on GitHub Discussions.` };
  console.log(JSON.stringify(entry), ranking);
  if (dry) return;
  popes.years = popes.years.filter((p) => p.year !== year).concat(entry);
  writeJson('data/popes.json', popes);
  const name = pool.find((v) => v.id === winner).name;
  await gql(`mutation($id:ID!){ unlockLockable(input:{lockableId:$id}){ clientMutationId } }`, { id: state.discussion.id }).catch(() => {});
  await gql(`mutation($id:ID!,$body:String!){ addDiscussionComment(input:{discussionId:$id,body:$body}){ comment { id } } }`, {
    id: state.discussion.id,
    body: `# ⚪ Habemus Papam!\n\n**${name}** è il Papa del ${year}, con ${count} voti. · **${name}** is the Pope of ${year}, with ${count} votes.\n\n${SITE}/it/papa/${year}/ · ${SITE}/en/pope/${year}/`,
  });
  await gql(`mutation($id:ID!){ lockLockable(input:{lockableId:$id, lockReason:RESOLVED}){ clientMutationId } }`, { id: state.discussion.id }).catch(() => {});
  state.status = 'elected';
  state.pope = winner;
  writeJson('data/conclave.json', state);
  writeFileSync(join(ROOT, '.conclave-result'), `${name}|${winner}|${count}`);
}

const run = { open, close, elect }[mode];
if (!run) throw new Error('usage: node scripts/conclave.mjs open|close|elect [year] [--dry]');
await run();
