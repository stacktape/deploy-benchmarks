// Stacktape, run from the binary in STACKTAPE_BIN: a release build of the CLI from COMMIT of stacktape/stacktape.
// Stacktape deploys into an AWS account connected in the Stacktape Console, with credentials the Console issues, not
// with AWS_PROFILE. STACKTAPE_AWS_ACCOUNT names that connection; it must be the account AWS_PROFILE points to.
// Git push journey: Stacktape Console GitOps (the project's GitHub repository connected in the Console). The Console
// runner uses the Stacktape version configured in the Console, not STACKTAPE_BIN.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { capture, findFunctions, imageBytes, REGION, serviceDir, sleep, STAGE, stackOutputs, zipSize } from '../lib.mjs';

// The stacktape/stacktape commit the published results were measured with. `version` checks that STACKTAPE_BIN was
// built from it (the build's version ends in the short commit). STACKTAPE_COMMIT measures another build without
// changing the generated files, so a Git push still continues the published branch.
const PINNED_COMMIT = '1aba589f64ecf4b99a21de493e0a19ce32188303';
const COMMIT = process.env.STACKTAPE_COMMIT ?? PINNED_COMMIT;
// The Stacktape project, and so the stack `<project>-bmk`, defaults to the test's name. STACKTAPE_PROJECT_NAME gives
// a second measurement in the same AWS account its own project and stack.
const project = (name) => process.env.STACKTAPE_PROJECT_NAME ?? name;

// `docs` is set when the commands are written into a branch README rather than run.
const bin = ({ docs } = {}) => (docs ? 'stacktape' : (process.env.STACKTAPE_BIN ?? 'stacktape'));
const common = ['--stage', STAGE, '--region', REGION];
const projectArgs = ({ docs }) => (!docs && process.env.STACKTAPE_PROJECT_NAME ? ['--projectName', process.env.STACKTAPE_PROJECT_NAME] : []);
function account({ docs }) {
  if (docs) return ['--awsAccount', '<connection-name>'];
  if (!process.env.STACKTAPE_AWS_ACCOUNT) throw new Error('Set STACKTAPE_AWS_ACCOUNT to the Console connection name of the AWS account to deploy to');
  return ['--awsAccount', process.env.STACKTAPE_AWS_ACCOUNT];
}
const camel = (s) => s.replace(/-(.)/g, (_, c) => c.toUpperCase());
const aws = (service, ...args) => JSON.parse(capture(['aws', service, ...args, '--region', REGION, '--output', 'json']));

// A Git push job writes to the runner log group in the deployment account: the Console logs the runner's start in
// `<invocation>/provisioning`, and SSM sends the job's output to `<command>/<instance>/aws-runShellScript/stdout`
// about once a second, so a line's time is its event's time, to about a second.
const RUNNER_LOGS = '/stacktape/ec2-runner';
const events = (args) => {
  const found = [];
  let token;
  do {
    const page = aws('logs', 'filter-log-events', '--log-group-name', RUNNER_LOGS, ...args, ...(token ? ['--next-token', token] : []));
    found.push(...page.events);
    token = page.nextToken;
  } while (token);
  return found.sort((a, b) => a.timestamp - b.timestamp);
};
const durationMs = (text) =>
  [...text.matchAll(/([\d.]+)(ms|s|m|h)/g)].reduce((ms, [, n, unit]) => ms + Number(n) * { ms: 1, s: 1000, m: 60_000, h: 3_600_000 }[unit], 0);

/**
 * Where the time of the Git push job started at or after `pushedAt` went, in ms after the push returned. The new code
 * can serve before the deploy command ends, so this waits up to 20 minutes for the job's end.
 */
async function runnerTimings({ name, pushedAt }) {
  const pushed = Date.parse(pushedAt);
  const start = ['--start-time', String(pushed - 60_000)];
  let command;
  let output = [];
  for (const deadline = Date.now() + 20 * 60_000; Date.now() < deadline; await sleep(15_000)) {
    command ??= events([...start, '--filter-pattern', `"--projectName ${project(name)} "`]).find((e) => e.timestamp >= pushed);
    if (!command) continue;
    output = events([...start, '--log-stream-name-prefix', command.logStreamName]);
    if (output.some((e) => /=== Build Complete ===|Elapsed: |failed to run commands/.test(e.message))) break;
  }
  if (!command) throw new Error(`No runner job of ${project(name)} after ${pushedAt}`);
  const [commandId, instanceId] = command.logStreamName.split('/');
  const provisioning = events([...start, '--filter-pattern', `"${commandId}"`]).find((e) => e.logStreamName.endsWith('/provisioning'));
  const consoleLog = provisioning ? events([...start, '--log-stream-names', provisioning.logStreamName]) : [];
  const at = (list, pattern) => list.find((e) => pattern.test(e.message))?.timestamp;
  const since = (t) => (t === undefined ? null : t - pushed);
  const first = consoleLog[0]?.message ?? '';
  // The CLI ends with a summary of its phases: `  ✓ Build & Package 10.4s`.
  const summary = output.map((e) => e.message).join('\n');
  const phases = Object.fromEntries([...summary.matchAll(/^\s*[✓✗] (.+?) ((?:[\d.]+(?:ms|s|m|h)\s?)+)$/gm)].map(([, phase, d]) => [phase.trim(), durationMs(d)]));
  const [image] = aws('ec2', 'describe-instances', '--instance-ids', instanceId).Reservations.flatMap((r) => r.Instances);
  return {
    runner: /Provisioning/.test(first) ? 'new' : /Starting existing|Waiting for EC2 runner/.test(first) ? 'stopped' : /Using existing/.test(first) ? 'running' : 'unknown',
    instanceId,
    instanceType: image?.InstanceType,
    ami: image?.ImageId,
    // From the push: the Console's first log line, the runner ready, the job's first output, the dependency install,
    // the deploy command and its end.
    queuedMs: since(consoleLog[0]?.timestamp),
    instanceLaunchedMs: since(image?.LaunchTime && Date.parse(image.LaunchTime)),
    runnerReadyMs: since(at(consoleLog, /Runner command started/)),
    jobStartedMs: since(at(output, /=== EC2 Runner Build/)),
    installStartedMs: since(at(output, /Installing dependencies/)),
    deployStartedMs: since(at(output, /^Running: stacktape /m)),
    deployEndedMs: since(at(output, /^\s*(Total|Elapsed): /m)),
    cliPhasesMs: phases
  };
}

function config({ app, name }) {
  const resources = {};
  if (app.kind === 'lambda') {
    for (const fn of app.functions) {
      const packaging = { entryfilePath: `packages/functions/src/handlers/${fn}.ts` };
      resources[camel(fn)] = {
        type: 'function',
        properties: { packaging: { type: 'js-bundle', properties: packaging }, runtime: 'nodejs22.x', memory: 512, timeout: 30 }
      };
    }
    return { projectName: name, resources };
  }
  for (const service of Object.keys(app.services)) {
    const dir = serviceDir(app, service);
    // Stacktape's docs recommend js-bundle for a Node.js server with one entry file and buildpack for Python.
    const packaging =
      app.language === 'python'
        ? { type: 'buildpack', properties: { sourceDirectoryPath: dir } }
        : { type: 'js-bundle', properties: { entryfilePath: join(dir, 'server.mjs') } };
    resources[service] = { type: 'web-service', properties: { codeSwap: true, packaging, resources: { cpu: 0.25, memory: 512 }, scaling: { minInstances: 1, maxInstances: 1 } } };
  }
  const outputs = Object.keys(app.services).map((s) => ({ name: `${s}Url`, value: `$ResourceParam('${s}', 'url')` }));
  return { projectName: name, resources, stackConfig: { outputs } };
}

export default {
  apps: ['lambda-1', 'lambda-5', 'lambda-25', 'container-node', 'container-python', 'five-services'],
  commit: COMMIT,
  docs: {
    name: 'Stacktape',
    account: 'a Stacktape account with the AWS account connected',
    version:
      `The Stacktape CLI built from source of [stacktape/stacktape](https://github.com/stacktape/stacktape) at commit [\`${PINNED_COMMIT.slice(0, 8)}\`](https://github.com/stacktape/stacktape/commit/${PINNED_COMMIT}), as described in the main README. Each result records the commit (\`stacktapeCommit\`).`,
    credentials: [
      '`AWS_PROFILE`: a profile for the disposable AWS account. The harness uses it to call the deployed code and read stack outputs.',
      '`STACKTAPE_API_KEY`, or run `stacktape login` once.',
      '`STACKTAPE_AWS_ACCOUNT`: the name of the AWS account connection in the Stacktape Console. Stacktape deploys with credentials from that connection, not with `AWS_PROFILE`, so check with `stacktape info:whoami` that both point to the same account.',
      '`STACKTAPE_BIN`: the path of the Stacktape binary to measure.'
    ],
    gitPush: () => [
      'Deploy this branch once with `stacktape deploy` from a terminal and answer yes to "Set up automatic deployments on push". This connects the repository and this branch to the project with the stage `bmk` in `eu-west-1`. Stacktape\'s GitHub app must have access to the repository.',
      'Every push then deploys on the project\'s runner in your AWS account: an EC2 instance with a cache disk, launched for the first push and hibernated after 15 idle minutes. The runner installs the Stacktape version set for the project in the Console from npm unless its image already contains that version. A build from source is not on npm; the main README describes how we measured one.',
      "To empty the runner's caches before each first push, remove the project's runner (its instance, cache disk and record) and pass `--cold-reset manual`. The Console can't do this yet; see the main README."
    ]
  },
  // JSON is valid YAML.
  files: (ctx) => ({ 'stacktape.yml': JSON.stringify(config(ctx), null, 2) }),
  version() {
    const version = capture([bin(), 'version']).match(/version: (\S+?)\.?$/m)?.[1];
    if (process.env.STACKTAPE_BIN && !version?.endsWith(COMMIT.slice(0, 8))) throw new Error(`${process.env.STACKTAPE_BIN} is version ${version}, not a build of ${COMMIT}`);
    return version;
  },
  buildOutputs: ['.stacktape'],
  // package is a local-credential command; its parser rejects --awsAccount. Pin the named AWS profile explicitly.
  package: (ctx) => [bin(ctx), 'package', ...common, '--profile', ctx.docs ? '<aws-profile>' : process.env.AWS_PROFILE],
  // `package` writes the function ZIPs and, beside them, the source maps that deploy uploads separately
  // (`*.source-maps.json`, gzip-compressed as `*.source-maps.json.gz` by newer builds). Shared layers are zipped only
  // during deploy, so we zip their directories here, storing their `node_modules` links as links as Stacktape's own
  // archive does. Container images go to the local Docker image store.
  artifacts({ app, dir }) {
    if (app.kind === 'service') return [{ file: 'api-service-container', bytes: imageBytes('api-service-container:latest') }];
    const [invocation] = readdirSync(join(dir, '.stacktape'));
    const build = join(dir, '.stacktape', invocation, 'build');
    const files = readdirSync(join(build, 'lambdas')).filter((f) => f.endsWith('.zip') || /\.source-maps\.json(\.gz)?$/.test(f));
    const layerDir = join(build, 'layers');
    const layers = existsSync(layerDir) ? readdirSync(layerDir, { withFileTypes: true }) : [];
    return [
      ...files.map((f) => ({ file: `lambdas/${f}`, path: join(build, 'lambdas', f) })),
      ...layers.map((e) =>
        e.isDirectory() ? { file: `layers/${e.name}.zip`, bytes: zipSize(join(layerDir, e.name), { symlinks: true }) } : { file: `layers/${e.name}`, path: join(layerDir, e.name) }
      )
    ];
  },
  // The default deploy handles handler-only, shared-only and mixed handler/helper edits.
  // Measure the normal mixed edit with --change mixed as well as the two isolated changes.
  deploy: (ctx) => [bin(ctx), 'deploy', ...common, ...projectArgs(ctx), ...account(ctx), '--autoConfirmOperation'],
  remove: (ctx) => [bin(ctx), 'delete', ...common, ...projectArgs(ctx), ...account(ctx), '--autoConfirmOperation'],
  deploymentResult({ app, log }) {
    if (app.kind !== 'service') return {};
    const output = readFileSync(log, 'utf8').replace(/\x1b\[[0-9;]*m/g, '');
    const lines = output.split('\n').filter((line) => /Swapped code in |Image deploy for |Code swap skipped/.test(line));
    const last = lines.at(-1) ?? '';
    return { codeSwapOptIn: true, deploymentMode: /Swapped code in /.test(last) ? 'code-swap' : 'image', deploymentDetail: last.trim() || 'No swap reported; see command log' };
  },
  buildInfo: (ctx) => runnerTimings(ctx),
  addresses({ app, name }) {
    if (app.kind === 'lambda') return findFunctions(`${project(name)}-${STAGE}-`, app.functions);
    const outputs = stackOutputs(`${project(name)}-${STAGE}`);
    return Object.fromEntries(Object.keys(app.services).map((s) => [s, outputs[`${s}Url`]]));
  }
};
