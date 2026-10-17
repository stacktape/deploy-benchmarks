// Ravion, building with Railpack on one-off EC2 Spot builders and deploying to ECS Fargate in the connected AWS account.
// Ravion deploys from a Git repository, so it has no CLI journey. Setup with the Ravion CLI, described in README.md:
// one project with a network, an ECS cluster and one web module per service, and one pipeline per service that
// builds and deploys every push to the test's branch. Set RAVION_URL_<SERVICE> (for example RAVION_URL_API) to each
// service URL.
import { capture, REGION, targetNames } from '../lib.mjs';

const ravion = (...args) => JSON.parse(capture(['ravion', ...args, '--json']));
// Each web module's ECR repository is named after the module's service name (README.md).
const repository = (app, s) => (app.id === 'five-services' ? `bmk-fs-${s}` : `bmk-${app.id}`);
const ecr = (...args) => JSON.parse(capture(['aws', 'ecr', ...args, '--region', REGION, '--output', 'json']));

export default {
  apps: ['container-node', 'container-python', 'five-services'],
  remoteBuild: true,
  docs: {
    name: 'Ravion',
    account: ['the Ravion CLI', 'the AWS CLI', 'a Ravion account with a disposable AWS account connected'],
    region: 'Deploy the services to `eu-west-1`.',
    configNote:
      'The Ravion configuration lives in your Ravion project, not in this branch. The [Ravion section of the main README](https://github.com/stacktape/deploy-benchmarks#ravion) lists it. Railpack detects the runtime, dependencies and start command from the source.',
    version: 'Hosted by Ravion: Railpack builds on a one-off EC2 Spot builder in your AWS account, deployed to ECS Fargate there. The harness reads build records with the Ravion CLI, and each result records its version.',
    credentials: [
      'Run `ravion login` once.',
      'AWS credentials for the connected account, for example `AWS_PROFILE`: the harness empties the build cache in ECR and reads image sizes from ECR.',
      '`RAVION_URL_API`, and for five services also `RAVION_URL_REPORTING`, `RAVION_URL_INVENTORY`, `RAVION_URL_WEBHOOKS` and `RAVION_URL_NOTIFICATIONS`: the URL of each service.'
    ],
    gitPush: ({ id }) => [
      "In Ravion, connect your AWS account, and install Ravion's GitHub app on your fork in Settings / Git connections.",
      `Create the Ravion project described in the main README: a network, an ECS cluster, ${id === 'five-services' ? 'one web module per service, with the service directory as its source directory' : 'one web module with the repository root as its source directory'}, and ${id === 'five-services' ? 'one pipeline per service that builds and deploys every push to this branch that changes the service directory' : 'one pipeline that builds and deploys every push to this branch'}.`,
      'Set the `RAVION_URL_*` variables to the service URLs.',
      "The first push of each pair empties the build cache: it deletes the `buildcache` and `railpack` tags from each changed service's ECR repository."
    ]
  },
  files: () => ({}), // Railpack detects the runtime, dependencies and start command from the source.
  version: () => capture(['ravion', '--version']),
  remove: () => {
    throw new Error('Delete the Ravion project and its modules with the Ravion CLI or dashboard');
  },
  addresses: ({ app }) => Object.fromEntries(targetNames(app).map((s) => [s, process.env[`RAVION_URL_${s.toUpperCase()}`]])),
  // Each build runs on a new EC2 instance, so its only cache is what BuildKit imports from the service's ECR
  // repository: the `buildcache` tag and the previous image, tagged `railpack`.
  resetCache: ({ app, run }) =>
    Promise.all(app.changed.map((s) => run(['aws', 'ecr', 'batch-delete-image', '--region', REGION, '--repository-name', repository(app, s), '--image-ids', 'imageTag=buildcache', 'imageTag=railpack']))),
  // The build step of each pipeline run started by the push. Its time includes starting the EC2 Spot builder. The
  // size is the compressed image size in ECR, which is what a push to an empty registry uploads. GitHub can start a
  // run before `git push` returns, so runs from the minute before pushedAt count too.
  buildInfo: ({ pushedAt }) =>
    ravion('pipeline', 'run', 'list', '--limit', '20')
      .filter((run) => Date.parse(run.createdAt) >= Date.parse(pushedAt) - 60_000)
      .flatMap((run) => ravion('pipeline', 'step-execution', 'list', '--pipeline-run-id', run.id, '--step-type', 'build'))
      .map((step) => {
        const { image_digest: digest, registry_uri: registry } = step.outputData ?? {};
        const image = digest && ecr('describe-images', '--repository-name', registry.split('/').pop(), '--image-ids', `imageDigest=${digest}`).imageDetails[0];
        return { run: step.pipelineRunId, buildMs: Date.parse(step.completedAt) - Date.parse(step.startedAt), bytes: image?.imageSizeInBytes ?? null };
      })
};
