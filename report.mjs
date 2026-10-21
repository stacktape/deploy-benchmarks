// Prints median, minimum and maximum of every series in results/*.jsonl.
//   node report.mjs              aligned text
//   node report.mjs --markdown   Markdown tables, as in README.md
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { APPS, ROOT, RESULTS_DIR } from './lib.mjs';

const markdown = process.argv.includes('--markdown');

const load = (file, directory = RESULTS_DIR) =>
  existsSync(join(ROOT, directory, file))
    ? readFileSync(join(ROOT, directory, file), 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line))
    : [];

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const seconds = (ms) => (ms / 1000).toFixed(1);
const megabytes = (bytes) => (bytes / 1e6).toFixed(2);
const stats = (values, format) => (values.length ? `${format(median(values))} (${format(Math.min(...values))}–${format(Math.max(...values))})` : '–');

function table(title, rows, key, columns) {
  const groups = new Map();
  for (const row of rows) {
    const id = key(row);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(row);
  }
  const lines = [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([id, group]) => [id, `${group.length}`, ...columns.map(([, c]) => c(group))]);
  const header = ['series', 'runs', ...columns.map(([heading]) => heading)];
  if (markdown) {
    console.log(`\n**${title}**\n`);
    for (const line of [header, header.map(() => '---'), ...lines]) console.log(`| ${line.join(' | ')} |`);
    return;
  }
  console.log(`\n${title}\n`);
  const widths = header.map((h, i) => Math.max(h.length, ...lines.map((l) => l[i].length)));
  for (const line of [header, ...lines]) console.log(line.map((cell, i) => cell.padEnd(widths[i])).join('  '));
}

// Container build time belongs to the deploy table: no tool builds an image except as part of its deploy.
const packages = load('package.jsonl');
const isContainer = (r) => APPS[r.app]?.kind === 'service';
const done = (g) => g.filter((r) => !r.failed);
table('Lambda packaging time and upload size', packages.filter((r) => !isContainer(r)), (r) => `${r.app} ${r.tool} ${r.cache}`, [
  ['failed', (g) => `${g.length - done(g).length}`],
  ['seconds: median (min–max)', (g) => stats(done(g).map((r) => r.ms), seconds)],
  ['MB: median (min–max)', (g) => stats(done(g).map((r) => r.bytes), megabytes)]
]);
table('Container image size', packages.filter(isContainer), (r) => `${r.app} ${r.tool}`, [
  ['MB: median (min–max)', (g) => stats(g.map((r) => r.bytes), megabytes)]
]);

// Failed or incorrect deploys are listed, not averaged in.
// A series measured separately can keep its rows in its own deploy-<name>.jsonl. A row with `excluded` was found
// invalid after the run; it stays in the data with the reason.
const deploys = (existsSync(join(ROOT, RESULTS_DIR)) ? readdirSync(join(ROOT, RESULTS_DIR)) : []).filter((f) => /^deploy(-[\w-]+)?\.jsonl$/.test(f)).sort().flatMap((file) => load(file));
const ok = (r) => r.businessOk && r.unchangedOk && !r.excluded;
table('Time from deploy start (or git push return) until the new code serves', deploys, (r) => `${r.app} ${r.tool} ${r.journey} ${r.change}${r.codeSwapOptIn ? ' opt-in/' + r.deploymentMode : ''}`, [
  ['valid', (g) => `${g.filter(ok).length}`],
  ['excluded', (g) => `${g.filter((r) => !ok(r)).length}`],
  ['seconds: median (min–max)', (g) => stats(g.filter(ok).map((r) => r.readyMs), seconds)]
]);
for (const r of deploys.filter((r) => !ok(r))) {
  const why = r.excluded ? `excluded: ${r.excluded}` : r.failed ? `failed: ${r.error}` : `business check ${r.businessOk ? 'passed' : 'failed'}, unchanged targets ${r.unchangedOk ? 'kept' : 'changed'}`;
  console.log(`${markdown ? '- ' : ''}Excluded: ${r.app} ${r.tool} ${r.journey} ${r.change} run ${r.run} (${why}); log ${r.log}`);
}

const resumes = load('resume.jsonl', 'results-extra');
table('Stacktape Git push after verified hibernation (separate samples)', resumes, (r) => `${r.app} ${r.tool} ${r.journey}`, [
  ['seconds: median (min–max)', (g) => stats(g.map((r) => r.readyMs), seconds)]
]);
