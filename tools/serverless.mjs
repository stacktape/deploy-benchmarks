// Serverless Framework v4. Needs SERVERLESS_ACCESS_KEY (or `serverless login`) in addition to AWS credentials.
// Git push journey: the shared GitHub Actions workflow (Serverless v4 has no Git deployment service of its own).
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { capture, findFunctions, githubActionsSetup, REGION, STAGE } from '../lib.mjs';

const VERSION = '4.44.0';
// The Serverless service is the functions package of the monorepo, the usual layout: Serverless installs the
// `external` packages at the versions in the service's own package.json.
const SERVICE = 'packages/functions';
const sls = ['npm', 'exec', `--workspace=${SERVICE}`, '--', 'serverless'];
const common = ['--stage', STAGE, '--region', REGION];

// The handlers are TypeScript, so v4 bundles them with its built-in esbuild by default; most Serverless projects
// bundle too (see README.md). Three settings make the package work:
// - `package.individually`: by default all functions share one ZIP. Here that ZIP holds every function's bundle and
//   source map, over 600 MB unpacked, and Lambda accepts at most 250 MB.
// - PDFKit reads its font files from disk, so it is `external` and Serverless installs it into the package.
// - The banner gives the ES module output a `require`, which CommonJS dependencies such as ExcelJS call for Node.js
//   built-ins.
// - `buildConcurrency: 8`, the benchmark machine's vCPU count. By default Serverless builds and zips every function at
//   once. For 25 functions that peaked at about 19 GB of memory, more than the 16 GB machine has, so the build swapped.
//   At 8 it peaked at about 9 GB. The setting has no effect on the 1- and 5-function apps.
const config = ({ app, name }) => `service: ${name}
frameworkVersion: '${VERSION}'
provider:
  name: aws
  runtime: nodejs22.x
  region: ${REGION}
  memorySize: 512
  timeout: 30
package:
  individually: true
build:
  esbuild:
    buildConcurrency: 8
    external:
      - pdfkit
    banner:
      js: "import { createRequire as __benchCreateRequire } from 'module'; const require = __benchCreateRequire(import.meta.url);"
functions:
${app.functions.map((fn) => `  ${fn}:\n    handler: src/handlers/${fn}.handler`).join('\n')}
`;

export default {
  apps: ['lambda-1', 'lambda-5', 'lambda-25'],
  devDependencies: { serverless: VERSION },
  gitDeploy: 'github-actions',
  docs: {
    name: 'Serverless Framework',
    account: 'a Serverless Framework account',
    version: `Serverless Framework ${VERSION}, installed by \`npm ci\` and pinned with \`frameworkVersion\` in \`serverless.yml\`.`,
    credentials: [
      '`AWS_PROFILE`: a profile for the disposable AWS account.',
      '`SERVERLESS_ACCESS_KEY`, or run `npm exec --workspace=packages/functions -- serverless login` once.'
    ],
    gitPush: () => githubActionsSetup(['AWS_ROLE_ARN', 'SERVERLESS_ACCESS_KEY'])
  },
  files: (ctx) => ({ [`${SERVICE}/serverless.yml`]: config(ctx) }),
  version: ({ dir }) => capture(['sh', '-c', `${sls.join(' ')} --version 2>&1`], dir).match(/Framework (\S+)/)?.[1],
  buildOutputs: [`${SERVICE}/.serverless`],
  package: () => [...sls, 'package', ...common],
  artifacts: ({ dir }) =>
    readdirSync(join(dir, SERVICE, '.serverless'))
      .filter((f) => f.endsWith('.zip'))
      .map((f) => ({ file: f, path: join(dir, SERVICE, '.serverless', f) })),
  // `serverless deploy` is the documented deploy. `serverless deploy function` is a separate, opt-in shortcut.
  deploy: () => [...sls, 'deploy', ...common],
  remove: () => [...sls, 'remove', ...common],
  addresses: ({ app, name }) => findFunctions(`${name}-${STAGE}-`, app.functions)
};
