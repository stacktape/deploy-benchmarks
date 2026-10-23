// Checks the rate of the clock that times the runs. The harness times with performance.now(), the machine's
// monotonic clock. On some machines (we saw it on WSL 2) that clock runs several percent fast or slow, while the
// wall clock is kept close to real time by stepping it, which makes the wall clock unusable for short intervals too.
//
//   node clock.mjs log                 once a minute, record the monotonic clock against AWS's time in clock.jsonl
//   node clock.mjs annotate            give every Git push row in deploy.jsonl the clock rate around it (clockRate)
//
// AWS's time comes from the Date header of an STS response, which has one-second resolution. Each mark waits for the
// second to change, so it pins AWS's time to about the request's round trip. report.mjs divides readyMs by clockRate.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, RESULTS_DIR } from './lib.mjs';

const file = (name) => join(ROOT, RESULTS_DIR, name);
const [command] = process.argv.slice(2);

async function mark() {
  let previous;
  for (let i = 0; i < 80; i++) {
    const before = performance.now();
    const response = await fetch('https://sts.eu-west-1.amazonaws.com/', { method: 'HEAD' }).catch(() => undefined);
    const after = performance.now();
    const date = response?.headers.get('date');
    if (date) {
      const aws = Date.parse(date);
      if (previous !== undefined && aws !== previous) {
        return { mono: Math.round(((before + after) / 2) * 10) / 10, rttMs: Math.round(after - before), wall: Date.now(), aws, at: new Date().toISOString() };
      }
      previous = aws;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/** Marks from one logger process: a restart starts the monotonic clock's origin again. */
function segments(marks) {
  const result = [];
  for (const m of marks) {
    if (!result.length || m.mono < result.at(-1).at(-1).mono) result.push([]);
    result.at(-1).push(m);
  }
  return result;
}

/** Least-squares slope of monotonic time against AWS time, from marks whose round trip was not unusually long. */
function rate(marks) {
  const rtts = marks.map((m) => m.rttMs).sort((a, b) => a - b);
  const good = marks.filter((m) => m.rttMs <= 1.5 * rtts[rtts.length >> 1]);
  if (good.length < 5) return undefined;
  const x = good.map((m) => m.aws);
  const y = good.map((m) => m.mono);
  const mx = x.reduce((a, b) => a + b) / x.length;
  const my = y.reduce((a, b) => a + b) / y.length;
  const slope = x.reduce((sum, xi, i) => sum + (xi - mx) * (y[i] - my), 0) / x.reduce((sum, xi) => sum + (xi - mx) ** 2, 0);
  return Math.round(slope * 100000) / 100000;
}

if (command === 'log') {
  for (;;) {
    const m = await mark();
    if (m) appendFileSync(file('clock.jsonl'), `${JSON.stringify(m)}\n`);
    await new Promise((resolve) => setTimeout(resolve, 60_000));
  }
} else if (command === 'annotate') {
  const marks = readFileSync(file('clock.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line));
  const runs = segments(marks);
  const rows = readFileSync(file('deploy.jsonl'), 'utf8').trim().split('\n').map((line) => JSON.parse(line));
  for (const row of rows) {
    if (!row.pushedAt) continue;
    // The rate over the 40 minutes around the push, from the logger that was running then.
    const pushed = Date.parse(row.pushedAt);
    const around = runs.map((s) => s.filter((m) => Math.abs(m.wall - pushed) <= 20 * 60_000)).sort((a, b) => b.length - a.length)[0];
    const r = rate(around ?? []);
    if (r) row.clockRate = r;
    else delete row.clockRate;
  }
  writeFileSync(file('deploy.jsonl'), `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
  for (const s of runs) console.log(`${s[0].at} → ${s.at(-1).at}: ${s.length} marks, monotonic/AWS ${rate(s) ?? 'too few marks'}`);
  console.log(`Annotated ${rows.filter((row) => row.clockRate).length} of ${rows.filter((row) => row.pushedAt).length} Git push rows.`);
} else {
  if (!existsSync(file('clock.jsonl')) && command !== 'log') console.error(`No ${file('clock.jsonl')} yet; run node clock.mjs log beside the runs.`);
  console.error('Usage: node clock.mjs log | annotate');
  process.exit(1);
}
