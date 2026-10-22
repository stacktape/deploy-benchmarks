# Deploy benchmarks

This repository measures two things for several deployment tools:

- **Packaging:** how long a tool takes to turn Lambda functions into what it uploads, and how big that upload is. For
  containers, only the image size.
- **Deploying a change:** how long it takes from starting a deploy until the changed code answers requests.

The tools are Stacktape, Serverless Framework, SST, AWS CDK, Render, Heroku and Ravion. Stacktape publishes these
results on its website, so we wrote down every choice we made. If you think a tool is set up worse than its users
would set it up, please [open an issue](#think-a-tool-is-set-up-badly).

## Reproduce one test

Every test has its own branch, named `<app>/<tool>`, for example
[`lambda-25/sst`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-25/sst). A branch holds only that
application and that tool's configuration, so it deploys as it is. Its README gives the tool version, the setup, the
commands and the shape of the result. The [list of branches](#test-branches) is below.

You need Node.js 22 or newer, npm, Git, Docker with BuildKit, `zip`, the AWS CLI and a disposable AWS account.
The AWS deployments run in `eu-west-1`. To measure how long SST takes to deploy a change to the 25-function Lambda backend:

```sh
git clone https://github.com/stacktape/deploy-benchmarks && cd deploy-benchmarks
npm ci
export AWS_PROFILE=<profile of a disposable account>
node bench.mjs setup  sst lambda-25            # write the lambda-25/sst branch to work/ and deploy it once (not measured)
node bench.mjs deploy sst lambda-25 --runs 10  # deploy a code change ten times
node report.mjs                                # median, fastest and slowest run
node bench.mjs remove sst lambda-25            # delete everything setup created
```

Replace `sst lambda-25` with any tool and application from the list of branches. The other measurements are
`node bench.mjs package` (packaging and image size) and `node bench.mjs push` (Git push), described in
[Run the benchmark](#run-the-benchmark). Each tool needs these credentials:

<!-- generated:credentials -->

| Tool | What it needs |
| --- | --- |
| Stacktape | `AWS_PROFILE`: a profile for the disposable AWS account. The harness uses it to call the deployed code and read stack outputs.<br>`STACKTAPE_API_KEY`, or run `stacktape login` once.<br>`STACKTAPE_AWS_ACCOUNT`: the name of the AWS account connection in the Stacktape Console. Stacktape deploys with credentials from that connection, not with `AWS_PROFILE`, so check with `stacktape info:whoami` that both point to the same account.<br>`STACKTAPE_BIN`: the path of the Stacktape binary to measure. |
| Serverless Framework | `AWS_PROFILE`: a profile for the disposable AWS account.<br>`SERVERLESS_ACCESS_KEY`, or run `npm exec --workspace=packages/functions -- serverless login` once. |
| SST | `AWS_PROFILE`: a profile for the disposable AWS account. |
| AWS CDK | `AWS_PROFILE`: a profile for the disposable AWS account. `cdk bootstrap` runs once during setup. |
| AWS CDK with hotswap | `AWS_PROFILE`: a profile for the disposable AWS account. `cdk bootstrap` runs once during setup. |
| Render | `RENDER_API_KEY`: the harness creates the services, reads their URLs and build events and empties their build caches through the Render API.<br>`BENCH_FORK`: the URL of your fork. Render's GitHub app must have access to it. |
| Heroku | `HEROKU_API_KEY`, or run `heroku login` once.<br>The builds plugin: `heroku plugins:install @heroku-cli/heroku-builds`. |
| Ravion | Run `ravion login` once.<br>AWS credentials for the connected account, for example `AWS_PROFILE`: the harness empties the build cache in ECR and reads image sizes from ECR.<br>`RAVION_URL_API`, and for five services also `RAVION_URL_REPORTING`, `RAVION_URL_INVENTORY`, `RAVION_URL_WEBHOOKS` and `RAVION_URL_NOTIFICATIONS`: the URL of each service. |

<!-- /generated:credentials -->

## 22 October 2026 rerun

This rerun measured every tool on the same machine in one session, with the Stacktape fixes merged up to
[`028ef1a7`](https://github.com/stacktape/stacktape/commit/028ef1a78e30f30e4fd37c3f0c383f61842b1175). It replaces the
21 October numbers, including the Serverless `lambda-25` cells that were measured while the machine was swapping. These
are qualification measurements of a source build, not released-CLI launch numbers.

- **Machine:** dedicated EC2 `i-0106242a6e01aa4f2`, Name `bmk-rerun-20261022`, `c7i.2xlarge` (8 vCPUs, 16 GB),
  Amazon Linux 2023, Node.js 24.15.0, Docker 29.7.2 with the containerd image store, buildx 0.38.0, Heroku CLI 11.12.0,
  in `eu-west-1`. Same 8 GiB swap file and EBS temporary directory as on 21 October.
- **Tools:** Stacktape `4.0.0-bench.028ef1a7` built from source as in
  [Build Stacktape from source](#build-stacktape-from-source), using the dev Console API and the `stacktape-e2e` account
  connection. Serverless 4.44.0 with `build.esbuild.buildConcurrency: 8`, SST 4.17.2, CDK CLI 2.1145.0, CDK hotswap,
  Heroku and Render as they were that night.
- **Scope:** Lambda `lambda-1`, `lambda-5` and `lambda-25` for every Lambda tool: ten clean and ten warm packaging runs,
  ten handler changes and ten shared-package changes. Ten CLI deploys per container app for Stacktape (with
  `codeSwap: true`), SST, AWS CDK, CDK hotswap and Heroku. One image size per container app for Stacktape, SST and CDK.
  Ten Render Git-push pairs per container app. Mixed changes, Ravion and every other Git-push journey were not rerun.
- **Order:** setup of all tests first (not measured). Packaging ran alone, 21 Oct 21:00–22:10 UTC. Lambda deploys ran
  alone, 22:11–00:45 UTC, by app in ten rounds that rotate the tool order and alternate handler and shared changes.
  Container deploys ran 00:45–01:57 UTC, one lane per app in parallel, ten rounds with a rotating tool order. The
  Render lanes ran 21:03–00:14 UTC beside packaging and the Lambda deploys; they only push and poll, Render builds on
  its own machines. One unmeasured deploy of each Stacktape container app ran after setup to confirm code swap worked
  with this build.
- **Validation:** all 300 packaging runs and all 510 deploy and push runs passed. Every deploy exited with code zero,
  served the expected revision, passed the business checks and kept unchanged services on their old code. Every one of
  the 30 Stacktape container deploys was an in-place code swap, none an image fallback. Every measured cell has ten
  valid runs.
- **Memory:** every run now records the machine's peak memory and the pages swapped in and out while it ran
  ([`memory.md`](results/2026-10-22/memory.md)). The highest peak was 11.9 of 15.3 GB. Serverless `lambda-25` peaked at
  11.5 GB with eight parallel builds and paged out at most about 68 MB in a run, with almost nothing paged back in, so
  no tool ran under memory pressure.
- **Data:** [`results/2026-10-22/`](results/2026-10-22), the [complete report](results/2026-10-22/report.md), the
  [comparison with 21 and 17 October](results/2026-10-22/comparison.md) and [`run.json`](results/2026-10-22/run.json).
  Reproduce the report with `BENCH_RESULTS_DIR=results/2026-10-22 node report.mjs --markdown`.

Every cell is median (minimum–maximum) of ten valid runs; **bold** is the best in its row. Upload sizes use decimal MB
and count each shared layer once.

**Lambda packaging, empty build cache: seconds**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | **2.3 (2.3–2.4)** | 5.8 (5.7–5.8) | 7.2 (6.9–7.5) | 3.4 (3.3–3.4) | 3.3 (3.2–3.5) |
| `lambda-5` | **3.1 (3.1–3.2)** | 9.7 (9.5–9.9) | 10.2 (10.0–10.6) | 6.0 (5.9–6.3) | 5.7 (5.5–5.9) |
| `lambda-25` | **3.8 (3.7–3.8)** | 28.4 (28.0–29.2) | 23.9 (23.7–24.2) | 17.6 (17.4–17.6) | 17.7 (17.3–17.9) |

**Lambda packaging, source change: seconds**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | **2.3 (2.3–2.3)** | 5.8 (5.6–6.0) | 7.2 (7.1–7.4) | 3.4 (3.3–3.4) | 3.3 (3.3–3.4) |
| `lambda-5` | **3.2 (3.1–3.2)** | 9.8 (9.5–9.9) | 10.7 (10.4–10.9) | 6.0 (5.9–6.0) | 5.6 (5.5–5.8) |
| `lambda-25` | **3.8 (3.7–3.8)** | 29.7 (29.1–30.1) | 25.0 (23.6–25.3) | 17.3 (16.6–17.8) | 17.8 (17.6–18.2) |

**Lambda upload size: MB, functions, layers and source maps**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | **7.79 (7.79–7.79)** | 19.87 (19.87–19.87) | 44.07 (44.07–44.07) | 10.33 (10.33–10.33) | 10.33 (10.33–10.33) |
| `lambda-5` | **19.52 (19.52–19.52)** | 96.08 (96.08–96.08) | 178.31 (178.31–178.31) | 25.31 (25.31–25.31) | 25.31 (25.31–25.31) |
| `lambda-25` | **19.55 (19.55–19.55)** | 464.31 (464.31–464.31) | 817.56 (817.56–817.56) | 96.47 (96.47–96.47) | 96.47 (96.47–96.47) |

**Lambda CLI deploy, handler changes: seconds until new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | **10.7 (10.4–11.6)** | 21.8 (21.0–24.5) | 15.4 (14.7–18.7) | 22.2 (21.9–25.0) | 13.2 (12.8–15.6) |
| `lambda-5` | **12.2 (11.7–12.7)** | 26.7 (26.3–27.6) | 18.3 (17.8–20.1) | 26.2 (25.2–30.0) | 16.5 (16.1–18.6) |
| `lambda-25` | **14.5 (12.9–19.7)** | 56.7 (53.7–61.8) | 35.0 (34.2–44.9) | 71.8 (46.5–75.7) | 36.9 (33.9–39.5) |

**Lambda CLI deploy, shared-package change: seconds until new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | **10.8 (10.6–10.9)** | 21.8 (21.3–22.8) | 15.2 (14.7–15.7) | 22.0 (21.6–26.9) | 13.1 (12.7–13.8) |
| `lambda-5` | 17.3 (16.9–18.1) | 27.2 (26.2–31.5) | 18.4 (17.9–18.9) | 25.5 (24.8–25.7) | **16.4 (15.8–17.2)** |
| `lambda-25` | **19.3 (18.6–20.7)** | 57.3 (53.4–83.2) | 35.2 (32.5–44.4) | 62.8 (47.9–80.8) | 36.2 (35.0–39.9) |

**Container CLI deploy: seconds until new code serves**

| App | Stacktape | SST | AWS CDK | CDK hotswap | Heroku |
| --- | --- | --- | --- | --- | --- |
| `container-node` | **4.1 (4.0–4.1)** | 54.5 (42.0–65.1) | 63.0 (60.0–92.1) | 44.5 (36.0–56.0) | 26.6 (25.0–28.1) |
| `container-python` | **7.6 (7.1–19.1)** | 48.5 (42.0–77.1) | 64.5 (61.0–74.0) | 42.5 (38.0–47.0) | 20.0 (19.0–58.1) |
| `five-services` | **6.1 (5.1–6.1)** | 58.5 (53.0–76.1) | 80.1 (70.0–91.1) | 55.0 (47.0–59.0) | 29.0 (26.0–35.0) |

**Container image size: MB, compressed, one measurement**

| App | Stacktape | SST | AWS CDK |
| --- | --- | --- | --- |
| `container-node` | **63.39 (63.39–63.39)** | 86.63 (86.63–86.63) | 86.63 (86.63–86.63) |
| `container-python` | **53.44 (53.44–53.44)** | 54.68 (54.68–54.68) | 54.68 (54.68–54.68) |

Stacktape's image sizes were packaged with `codeSwap` removed from the configuration, because `stacktape package`
fails when it is set (see [Stacktape bug found in this run](#stacktape-bug-found-in-this-run)). The images the
code-swap services actually ran are larger: 66.40 MB for `container-node` and 56.46 MB for `container-python`, plus a
2.2 MB `stp-cloudmap-drain` sidecar image in the same task definition
([`stacktape-running-images.json`](results/2026-10-22/stacktape-running-images.json)). With code swap on, the Python
image would be 1.8 MB larger than SST's and CDK's 54.68 MB.

**Git push: seconds from `git push` until the new code serves (only Render rerun)**

Only Render's Git push was rerun, on 22 October. The other columns are the 17 October measurements (Stacktape: 17–18
October, dev Console runner, CLI `16d16c8e`, small sample counts). The dev Console runner does not have the latest
runner changes, so Stacktape's Git push was not rerun. The owner dropped the first-push container test, which
Stacktape loses.

| App | Push | Stacktape 17–18 Oct | Serverless 17 Oct | SST 17 Oct | AWS CDK 17 Oct | Render 22 Oct | Heroku 17 Oct |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `lambda-1` | first push | pending | 57.4 (47.1–61.5) | **57.2 (49.8–64.3)** | 58.9 (53.7–66.1) |  |  |
| `lambda-5` | first push | 226.9 (220.5–231.9), n=4 | 65.0 (58.0–93.7) | **59.2 (53.9–63.4)** | 59.9 (51.9–69.0) |  |  |
| `lambda-25` | first push | 220.7 (125.8–240.4), n=4 | 127.8 (109.6–219.4) | **72.0 (58.9–86.1)** | 102.8 (82.3–165.2) |  |  |
| `lambda-1` | 15 minutes later | pending | **55.4 (47.2–60.9)** | 58.1 (48.5–65.4) | 55.5 (49.9–63.4) |  |  |
| `lambda-5` | 15 minutes later | **30.9 (30.4–35.2), n=3** | 64.4 (55.6–99.4) | 60.4 (45.3–66.6) | 59.8 (49.9–69.8) |  |  |
| `lambda-25` | 15 minutes later | **33.2 (32.9–34.7), n=3** | 118.4 (110.3–139.9) | 75.4 (62.7–84.4) | 105.0 (68.2–134.7) |  |  |
| `container-node` | 15 minutes later | 56.1 (50.1–60.1), n=4 |  | 97.5 (86.0–116.1) | 109.6 (97.0–122.1) | 44.1 (36.1–89.1) | **37.0 (33.0–76.1)** |
| `container-python` | 15 minutes later | pending |  | 96.1 (86.0–115.1) | 105.1 (96.0–116.1) | 59.1 (53.1–105.1) | **29.0 (27.0–34.0)** |
| `five-services` | 15 minutes later | pending |  | 115.0 (106.0–134.1) | 112.1 (100.0–130.0) | **43.1 (36.1–67.1)** |  |

Render's first pushes on 22 October, for reference: 35.1 (31.1–44.1) for `container-node`, 61.6 (48.1–96.1) for
`container-python` and 43.1 (35.0–70.1) for `five-services`. The Stacktape first-push Lambda numbers above predate the
runner preparation fix in [stacktape#255](https://github.com/stacktape/stacktape/pull/255); the owner measured about
54 s for `lambda-5` and 61 s for `lambda-25` after it, without a sample range, so they are not in the table.

**What Stacktape wins and loses**

Counting the 20 cells measured in this run (packaging, upload size, the two Lambda deploys, container deploys and image
size), Stacktape is fastest or smallest in 19, a 95% win rate. Git push is not counted, because only Render was rerun.

| Cell | `lambda-1` | `lambda-5` | `lambda-25` |
| --- | --- | --- | --- |
| Packaging, empty cache | win: 2.3 vs CDK hotswap 3.3 | win: 3.1 vs CDK hotswap 5.7 | win: 3.8 vs CDK 17.6 |
| Packaging, source change | win: 2.3 vs CDK hotswap 3.3 | win: 3.2 vs CDK hotswap 5.6 | win: 3.8 vs CDK 17.3 |
| Upload size (MB) | win: 7.79 vs CDK 10.33 | win: 19.52 vs CDK 25.31 | win: 19.55 vs CDK 96.47 |
| Deploy, handler change | win: 10.7 vs CDK hotswap 13.2 | win: 12.2 vs CDK hotswap 16.5 | win: 14.5 vs SST 35.0 |
| Deploy, shared change | win: 10.8 vs CDK hotswap 13.1 | **loss: 17.3 vs CDK hotswap 16.4** | win: 19.3 vs SST 35.2 |

| Cell | `container-node` | `container-python` | `five-services` |
| --- | --- | --- | --- |
| CLI deploy | win: 4.1 vs Heroku 26.6 | win: 7.6 vs Heroku 20.0 | win: 6.1 vs Heroku 29.0 |
| Image size (MB) | win: 63.39 vs CDK/SST 86.63 | win: 53.44 vs CDK/SST 54.68 |  |

- **The one loss: the five-function shared change** (17.3 s versus CDK hotswap's 16.4 s; SST takes 18.4 s). Stacktape
  keeps the shared package in a shared Lambda layer. A shared edit publishes a new layer version and points every
  function at it. The CLI's Deploy phase takes about 9.4 s for this, against 4.2 s for a handler edit. As with handler
  edits, the functions answer from the new code about 3.5 s after the CLI exits. CDK hotswap bundles the shared code into each
  function and only uploads five ZIPs (25 MB) and updates their code. At 25 functions that duplication costs CDK
  hotswap 96 MB of uploads and Stacktape wins, 19.3 s against SST's 35.2 s.
- **Container deploys measure an opt-in feature.** With `codeSwap: true`, Stacktape replaces the code inside the running
  Fargate task; no image is built or pulled and no task is replaced. SST, CDK and CDK hotswap roll out a new image and a
  new task, and Heroku builds a slug and restarts the dyno. Code swap applies only to code changes on eligible
  services; a dependency or configuration change uses Stacktape's normal image deploy. That path was last measured on
  17 October at 40.1, 47.6 and 57.6 s, which loses to Heroku (28.0, 21.6, 30.5 s) and, for Python and five services, to CDK hotswap (40.5, 54.5 s).
- **Python image size is close.** The default Stacktape Python image is 1.2 MB smaller than SST's and CDK's; the
  code-swap image is 1.8 MB larger (see above).

**Cells that may look unfair to a competitor**

- CDK hotswap leaves the CloudFormation stack out of date and is documented for development stacks only; the CDK
  column is the same tool without it.
- SST's packaging time includes `sst diff`, which compares the plan with AWS, because SST has no packaging-only command.
- CDK's packaging time excludes zipping, which CDK does during deploy (its upload size includes the ZIPs).
- Serverless uses `serverless deploy` for every change; `serverless deploy function` would be faster for a single
  function but skips CloudFormation.
- Heroku and Render build on their own machines in the EU, so their times include their build queues. Render
  deploys from a second copy of the fork, as on 17 October.
- SST's container command exits about 8 s after it starts, before the new task serves; CDK's command waits for ECS to
  settle (190–240 s). Both are timed until the new code serves, not until the command exits.

### Stacktape bug found in this run

`stacktape package` fails for a stack whose web services set `codeSwap: true`:

```text
[x] Unexpected Error
An unexpected error occurred. Last captured event: PACKAGE_ARTIFACTS.
[x] No value provided for input HTTP label: Bucket. (UNEXPECTED_ERROR)
```

It failed for `container-node` and `container-python` in the packaging phase
(`stacktape package --stage bmk --region eu-west-1 --profile stacktape-e2e`), and again in a copy of the project with
`--logLevel debug`. The same copy with `codeSwap` removed packaged normally (60.45 MB image reported by the CLI).
`stacktape deploy` with `codeSwap: true` works. The code-swap image extension seems to need the deployment bucket name,
which `package` does not resolve. Stacktape's image sizes above were measured without `codeSwap` because of this.

### Cleanup verification

Every test was removed with `node bench.mjs remove`. Stacktape's delete of `five-services` failed twice on API Gateway
VPC-link deletion (`InternalFailure`); after the remaining VPC link was deleted directly, the third delete succeeded.
What the tools' own removal leaves was then deleted: CDK hotswap's task-definition revisions, the CDK functions' and
services' log groups, the CDK assets and images uploaded during the run, and SST's bootstrap (its state and asset
buckets, asset repository and parameters), which this run created. The runner instance, its root volume, security
group, IAM role and instance profile, the secrets in SSM and the transfer bucket are gone, and no Heroku app or
`bmk-render-*` service remains. Only `CDKToolkit` and `stacktape-cmu16jloi000007q2pix3alju` remain as stacks. The 180
deleted task-definition revisions are `DELETE_IN_PROGRESS` until AWS finishes removing them. Details are in
[`cleanup.json`](results/2026-10-22/cleanup.json).

## 21 October 2026 focused qualification

This run introduced the larger Lambda fixtures and Stacktape's opt-in container code swap; the 22 October rerun above replaces its numbers. Packaging samples ran
05:56–08:20 UTC; deploy samples ran 08:21–12:42 UTC on 21 October. These are qualification measurements of source
builds, not released-CLI launch numbers. The 17 October results below remain the baseline.

- **Machine:** dedicated EC2 `i-0af726906cc90edc0`, Name `bmk-rerun-20261021-68a687de`, `c7i.2xlarge`
  (8 vCPUs, 16 GB), Amazon Linux 2023, Node.js 24.15.0, in `eu-west-1`. All tools shared the 8 GiB swap file and
  EBS temporary directory; there was no per-tool concurrency tuning. Serverless's 25-function builds paged to disk,
  so its `lambda-25` numbers below are not a fair measurement (see note [a]).
- **Scope:** Lambda `lambda-1`, `lambda-5`, `lambda-25` for Stacktape, Serverless 4.44.0, SST 4.17.2, CDK CLI
  2.1145.0 and CDK hotswap: ten clean and ten warm packaging samples, ten handler changes and ten shared changes
  per tool/app. Stacktape additionally has ten CLI deployments per container app with `codeSwap: true`.
  Mixed changes and Git-push journeys were not rerun. Competitor container results remain from 17 October.
- **Stacktape revisions:** Lambda `4.0.0-bench.1aba589f`, source
  [`1aba589f`](https://github.com/stacktape/stacktape/commit/1aba589f64ecf4b99a21de493e0a19ce32188303);
  containers `4.0.0-bench.b1ab2385`, source
  [`b1ab2385`](https://github.com/stacktape/stacktape/commit/b1ab238583968b11f085c620b67811acadb536e4), including
  the release supervisor fix. Set `STACKTAPE_COMMIT` to the applicable revision when reproducing each series.
  The remote harness checkout was `45b758b232e06a21a8a6469f290b6003bf649785`; its Stacktape default pin was
  `1aba589f`, with the container revision supplied through the environment.
- **Order and validation:** packaging ran serially; Lambda deploys ran by app and then in ten rounds, rotating
  through tools and handler/shared changes. The container series overlapped the Lambda series. All 300 packaging
  samples and all 330 deploy samples passed; each deploy returned exit code zero, served the expected revision,
  passed business checks, and preserved unchanged services. Each of the 63 measured cells has ten valid samples.
  The maximum unpacked function including all its layers was 79.91 MB, below the run's 200 MiB guard and Lambda's
  250 MiB limit. The local fixture check also passed all 25 handlers.
- **Data:** [`results/2026-10-21/`](results/2026-10-21), the
  [complete report](results/2026-10-21/report.md), and the
  [cell-by-cell comparison with 17 October](results/2026-10-21/comparison.md).
  Reproduce the report with `BENCH_RESULTS_DIR=results/2026-10-21 node report.mjs --markdown`.
  Its final resume table comes from the historical `results-extra/` samples, not this run.

Every new cell below is median (minimum–maximum), ten valid runs. Upload sizes use decimal MB and count each shared
layer once. The same application source and production dependency locks went to every tool. See
[the fixture description](fixtures/README.md) for the real integrations and document processing added on 21 October.


**Lambda packaging, empty build cache: seconds**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | 2.3 (2.2–2.3) | 5.7 (5.6–5.9) | 7.0 (6.9–7.3) | 3.3 (3.2–3.4) | 3.3 (3.2–3.4) |
| `lambda-5` | 6.4 (5.2–6.5) | 9.2 (9.1–9.4) | 9.6 (9.4–9.8) | 5.6 (5.5–5.7) | 5.5 (5.5–5.6) |
| `lambda-25` | 9.1 (8.0–9.3) | 204.7 (161.6–308.4) [a] | 22.5 (22.2–23.3) | 16.6 (16.6–16.7) | 16.6 (16.5–17.0) |

**Lambda packaging, source change: seconds**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | 2.2 (2.2–2.3) | 5.7 (5.6–5.8) | 7.2 (7.0–7.6) | 3.3 (3.2–3.4) | 3.3 (3.2–3.4) |
| `lambda-5` | 6.4 (5.2–6.8) | 9.2 (9.0–9.4) | 10.1 (10.0–10.3) | 5.5 (5.5–5.7) | 5.5 (5.4–5.6) |
| `lambda-25` | 9.1 (8.0–9.3) | 253.4 (130.1–348.0) [a] | 23.3 (22.5–23.6) | 16.9 (16.7–17.3) | 16.9 (16.7–17.3) |

**Lambda upload size: MB, functions, layers and source maps**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | 7.79 (7.79–7.79) | 19.87 (19.87–19.87) | 44.07 (44.07–44.07) | 10.33 (10.33–10.33) | 10.33 (10.33–10.33) |
| `lambda-5` | 19.52 (19.52–19.52) | 96.08 (96.08–96.08) | 178.31 (178.31–178.31) | 25.31 (25.31–25.31) | 25.31 (25.31–25.31) |
| `lambda-25` | 19.54 (19.54–19.54) | 464.31 (464.31–464.31) | 817.56 (817.56–817.56) | 96.47 (96.47–96.47) | 96.47 (96.47–96.47) |

**Lambda CLI deploy, handler changes: seconds until new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | 10.6 (10.1–13.3) | 22.1 (21.6–24.9) | 15.1 (14.6–18.3) | 22.3 (21.3–32.5) | 13.1 (12.6–14.9) |
| `lambda-5` | 15.6 (13.9–16.6) | 27.2 (26.4–28.4) | 18.2 (17.8–20.8) | 25.6 (25.1–27.4) | 16.2 (16.0–20.4) |
| `lambda-25` | 21.2 (20.7–22.7) | 361.9 (196.0–418.7) [a] | 43.2 (42.7–44.3) | 71.0 (49.3–78.0) | 38.0 (36.5–39.7) |

**Lambda CLI deploy, shared-package change: seconds until new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap |
| --- | --- | --- | --- | --- | --- |
| `lambda-1` | 10.6 (10.4–11.2) | 21.8 (21.6–23.5) | 15.1 (14.5–15.5) | 22.2 (21.3–22.8) | 13.1 (12.3–13.7) |
| `lambda-5` | 30.7 (30.1–32.8) | 26.5 (25.8–27.8) | 18.1 (17.6–18.5) | 26.1 (25.1–35.6) | 16.2 (15.9–16.5) |
| `lambda-25` | 51.4 (49.8–53.3) | 363.0 (214.5–468.0) [a] | 33.4 (31.3–34.5) | 67.9 (45.7–74.7) | 35.7 (33.0–36.6) |

[a] Affected by memory pressure; re-measured on 22 October with `buildConcurrency: 8` (28.4 s packaging, 56.7 s handler deploy). Serverless 4.44 builds and zips every function at the same
time by default (`build.esbuild.buildConcurrency` defaults to the number of functions). With the 21 October fixture,
25 parallel builds need more memory than the 16 GB benchmark machine has, so the machine swapped. Packaging the same
project on a 43 GB development machine, limited to 8 CPUs, peaked at about 19 GB of memory for the default and about
9 GB with `buildConcurrency: 8`. On 17 October, with the smaller fixture, Serverless packaged `lambda-25` in 19.5 s.
A user who hit this would limit the build concurrency, so the configuration now sets `buildConcurrency: 8`, the
machine's vCPU count (see
[Serverless Framework](#serverless-framework)). These four cells were measured before that change. The other tools'
25-function timings varied by about one second, with no sign of swapping, so no other tool's settings changed.

**Container CLI deploy: seconds until new code serves**

Stacktape: 21 October, `codeSwap: true`. Competitors: unchanged 17 October measurements.

This table mixes dates: Stacktape's code swap ran on 21 October, while the competitor and Stacktape image rollouts
ran on 17 October. AWS conditions on the two days can differ. The next full rerun will measure the competitors'
container deployments on the same day as Stacktape.

| App | Stacktape opt-in | Stacktape 17 Oct image | SST 17 Oct | AWS CDK 17 Oct | CDK hotswap 17 Oct | Heroku 17 Oct |
| --- | --- | --- | --- | --- | --- | --- |
| `container-node` | 4.1 (4.0–5.1) | 40.1 (32.1–50.1) | 138.6 (49.0–168.1) | 68.1 (60.0–78.1) | 49.5 (36.0–64.1) | 28.0 (25.0–30.1) |
| `container-python` | 55.1 (37.1–72.1) | 47.6 (39.1–65.1) | 96.6 (44.0–428.2) [1 failed] | 66.1 (61.0–85.1) | 40.5 (36.0–58.1) | 21.6 (19.1–47.1) |
| `five-services` | 64.6 (48.1–81.1) | 57.6 (38.1–63.1) | 73.0 (54.0–408.2) [1 failed] | 77.6 (72.1–86.1) | 54.5 (46.0–58.0) | 30.5 (28.0–64.1) |

**What Stacktape wins and loses**

- Stacktape has the smallest upload for all three Lambda apps. At 25 functions its shared layers keep the complete
  upload at 19.54 MB, versus CDK's 96.47 MB, Serverless's 464.31 MB and SST's 817.56 MB. The larger dependency graph
  is uploaded once in shared layers rather than repeated in each function bundle.
- Stacktape wins handler-change deployment for all three Lambda apps, and the single-function shared change.
  Handler-only updates reuse the shared layer and update function code directly.
- Stacktape wins clean/warm packaging at one and 25 functions. It loses both five-function packaging rows to CDK
  and CDK hotswap (6.4 s versus about 5.5 s). Its shared-layer build has overhead at this scale; the smaller upload
  does not imply faster packaging. These timings do not include layer zipping that happens during deploy.
- Stacktape loses the five-function shared change to every competitor (30.7 s versus 16.2–26.5 s), and the
  25-function shared change to SST and CDK hotswap (51.4 s versus 33.4/35.7 s). Changing the shared package changes
  the layer, requiring a CloudFormation update rather than the direct function-code path. Representative CLI phase
  summaries spent 22.8 s and 42.8 s in Deploy for five and 25 functions, after 6.9 s and 11.7 s in Build & Package.
  Shared upload savings do not eliminate CloudFormation's update time.
- Node's ten opt-in container samples all used code swap: 4.1 s (4.0–5.1), versus Stacktape's 17 October image
  deployment at 40.1 s (32.1–50.1). This wins against the retained container competitor measurements.
- Python's ten samples all used image fallback because only Node.js `js-bundle` packaging is qualified for code
  swap. Five-services also used image fallback because this release supports one container service per stack.
  Python (55.1 s) and five-services (64.6 s) lose to Heroku and CDK hotswap's 17 October medians. Image building and
  ECS task rollout remain on their deployment path. Their ranges overlap the previous Stacktape image results;
  opting in did not enable a swap for either app.
- Serverless's 25-function packaging and deploy times include substantial paging on this 16 GB host, caused by its
  default build concurrency (note [a]). They are not a fair comparison and will be re-measured with
  `buildConcurrency: 8`. Do not quote them as Serverless's speed.

**Git-push scope decision (owner-provided, not measured in this rerun)**

The owner dropped the cold Git-push container test. After the runner preparation fix in
[stacktape#255](https://github.com/stacktape/stacktape/pull/255) and
[console-app#104](https://github.com/stacktape/console-app/pull/104), Stacktape still loses: about 45 s versus
Render's 34 s. Cold Lambda Git push is now about 54 s for `lambda-5` and 61 s for `lambda-25` in those PRs.
Those are separate Stacktape-only measurements; no competitor Git-push journeys were rerun here, and these point
values have no range or sample count supplied with this handoff. They do not replace the historical raw series.


**Cleanup verification**

All `bmk-*` CloudFormation stacks were deleted, using the harness removal commands first. API Gateway throttling
required retries and individual VPC-link deletion before the last stack could be removed. The EC2 instance is
terminated; its 200 GB root volume, security group, key pair, IAM role and instance profile are absent. SST's state
and asset buckets, asset repository, bootstrap parameter and six app passphrase parameters were removed. The 1,391
recorded CDK file assets and their object versions were deleted while retaining `CDKToolkit` and its bucket.
Benchmark log groups were removed. Only `CDKToolkit` and `stacktape-cmu16jloi000007q2pix3alju` remain as stacks.

ECS accepted deletion of 53 task-definition revisions. They are still `DELETE_IN_PROGRESS`; there are no ECS
clusters or active/inactive task definitions. AWS can take up to 24 hours to finish removing task-definition metadata
after its service deployments are deleted ([AWS documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-definition-state.html)).
That final metadata removal remains pending. The exact verification and timestamp are in
[`cleanup.json`](results/2026-10-21/cleanup.json).

## Results

These are the results of a **qualification run** on 17 October 2026, between 13:47 and 20:37 UTC. It checked the
harness on a dedicated machine and measured the Stacktape fixes merged up to
[`d51f56ad`](https://github.com/stacktape/stacktape/commit/d51f56ad17b9a24056046d7af99bd3716afb30da). The figures on
stacktape.com will come from a rerun with the released Stacktape CLI (Stacktape's launch item L20), so these numbers
can change before then.

- **Machine:** an EC2 `c7i.2xlarge` (8 vCPUs, 16 GB) in `eu-west-1`, Amazon Linux 2023, Node.js 24.15.0, Docker
  29.7.2 with the containerd image store and buildx 0.38. Each result records the machine.
- **Stacktape:** CLI `4.0.0-bench.d51f56ad`, built from source as described in
  [Build Stacktape from source](#build-stacktape-from-source).
- **Other tools:** Serverless Framework 4.44.0, SST 4.17.2, CDK CLI 2.1145.0 and Heroku CLI 11.12.0, as pinned in
  `configs/`. Render and Heroku built with what they offered that day.
- **Harness:** this repository from commit `b10797f` on. The fixes made during the run are listed under
  [Changes during the run](#changes-during-the-run).
- **Order:** packaging ran alone on the machine. The deploy tests then ran in rounds, one run of each tool per round,
  with up to four series at a time (Lambda, and one per container application); the Git push pairs ran next to them.
  The machine's 5-minute load average stayed below 3 during the deploy tests.
- **Raw data:** every run is in [`results/`](results). `node report.mjs` prints every series; its full output is at
  the end of this section.

Unless a cell gives `n`, it is the median of at least 10 runs, with the fastest and slowest run in brackets.
Stacktape Git-push samples have smaller counts, shown explicitly below. Times are in seconds.
**Bold** is the fastest or smallest in its row. A blank cell means the tool has no such test (see
[What we measured](#what-we-measured)). `[n failed]` counts runs that failed and are left out of the median.

**Not measured yet:**

- **Stacktape Git push** remains unmeasured for `lambda-1`, `container-python` and `five-services`. The three
  measured apps use a separate source-built CLI and test runner image, as described below.
- **Ravion** is pending: our Ravion account needs a setup step from its owner.
- **Ravion five-services** is blocked by a Ravion bug: its EC2 builder applies `source_base_path` twice (see
  [Ravion](#ravion)).

**Packaging time in seconds, empty build cache: median (fastest–slowest)**

| App | Stacktape | Serverless | SST | AWS CDK |
| --- | --- | --- | --- | --- |
| `lambda-1` | **1.7 (1.7–1.7)** | 5.2 (5.0–5.5) | 6.3 (6.2–6.5) | 3.0 (2.9–3.3) |
| `lambda-5` | **1.9 (1.8–1.9)** | 7.0 (6.9–7.2) | 7.6 (7.5–8.0) | 4.4 (4.3–4.5) |
| `lambda-25` | **3.2 (3.1–3.2)** | 19.5 (19.2–19.8) | 14.0 (13.7–14.3) | 11.4 (11.3–11.5) |

**Packaging time in seconds, after a source change: median (fastest–slowest)**

| App | Stacktape | Serverless | SST | AWS CDK |
| --- | --- | --- | --- | --- |
| `lambda-1` | **1.7 (1.7–1.7)** | 5.1 (5.0–5.3) | 6.4 (6.2–6.5) | 3.0 (2.9–3.0) |
| `lambda-5` | **1.9 (1.8–1.9)** | 7.0 (6.9–7.2) | 7.8 (7.6–8.1) | 4.4 (4.3–4.4) |
| `lambda-25` | **3.2 (3.1–3.3)** | 19.6 (19.3–20.4) | 14.7 (14.4–15.0) | 11.4 (11.3–11.6) |

**Upload size in MB (functions, layers and source maps)**

| App | Stacktape | Serverless | SST | AWS CDK |
| --- | --- | --- | --- | --- |
| `lambda-1` | **6.6** | 16.5 | 33.7 | 9.4 |
| `lambda-5` | **6.7** | 74.6 | 115.8 | 19.3 |
| `lambda-25` | **6.7** | 361.8 | 515.5 | 68.1 |

**Container image size in MB (compressed, one measurement)**

| App | Stacktape | SST | AWS CDK |
| --- | --- | --- | --- |
| `container-node` | **63.3** | 86.6 | 86.6 |
| `container-python` | **53.4** | 54.7 | 54.7 |

**Deploy from the CLI: seconds until the new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap | Heroku |
| --- | --- | --- | --- | --- | --- | --- |
| `lambda-1` | **9.5 (8.8–11.1)** | 19.8 (18.5–21.3) | 13.8 (13.3–20.3) | 20.7 (20.3–22.1) | 11.4 (10.9–12.7) |  |
| `lambda-5` | **9.8 (7.2–10.5)** | 23.1 (22.6–24.7) | 14.9 (14.1–15.2) | 22.4 (22.1–23.7) | 13.4 (12.7–14.5) |  |
| `lambda-25` | **11.9 (10.5–12.3)** | 48.0 (45.9–66.3) | 32.2 (25.4–33.3) | 58.7 (38.9–66.9) | 27.1 (26.0–28.4) |  |
| `container-node` | 40.1 (32.1–50.1) |  | 138.6 (49.0–168.1) | 68.1 (60.0–78.1) | 49.5 (36.0–64.1) | **28.0 (25.0–30.1)** |
| `container-python` | 47.6 (39.1–65.1) |  | 96.6 (44.0–428.2) [1 failed] | 66.1 (61.0–85.1) | 40.5 (36.0–58.1) | **21.6 (19.1–47.1)** |
| `five-services` | 57.6 (38.1–63.1) |  | 73.0 (54.0–408.2) [1 failed] | 77.6 (72.1–86.1) | 54.5 (46.0–58.0) | **30.5 (28.0–64.1)** |

**Deploy from the CLI, shared-package change (every function): seconds until the new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | CDK hotswap | Heroku |
| --- | --- | --- | --- | --- | --- | --- |
| `lambda-1` | **9.5 (9.1–9.9)** | 19.7 (19.2–20.6) | 13.6 (13.0–16.7) [2 failed] | 20.8 (20.2–21.3) | 11.6 (11.4–12.4) |  |
| `lambda-5` | 29.9 (28.9–31.1) | 23.1 (22.3–108.2) | 14.8 (14.5–15.8) | 22.6 (22.2–23.5) | **13.2 (12.8–13.5)** |  |
| `lambda-25` | 37.7 (34.3–114.4) | 46.7 (43.3–50.6) | 31.7 (29.3–33.2) | 58.4 (38.6–68.6) | **25.8 (24.8–27.9)** |  |

**Git push with an empty build cache: seconds from `git push` until the new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | Render | Heroku | Ravion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `lambda-1` | pending | 57.4 (47.1–61.5) | **57.2 (49.8–64.3)** | 58.9 (53.7–66.1) |  |  |  |
| `lambda-5` | 226.9 (220.5–231.9), n=4 | 65.0 (58.0–93.7) | **59.2 (53.9–63.4)** | 59.9 (51.9–69.0) |  |  |  |
| `lambda-25` | 220.7 (125.8–240.4), n=4 | 127.8 (109.6–219.4) | **72.0 (58.9–86.1)** | 102.8 (82.3–165.2) |  |  |  |
| `container-node` | 254.2 (166.2–266.2), n=5 |  | 417.2 (93.1–424.2) | 108.1 (100.1–119.1) | **34.1 (28.1–116.1)** | 37.5 (34.0–42.0) | pending |
| `container-python` | pending |  | 410.7 (83.1–430.2) | 101.1 (94.0–106.1) | 54.1 (45.1–74.1) | **33.6 (29.1–38.1)** | pending |
| `five-services` | pending |  | 273.1 (125.1–414.2) | 117.0 (111.0–126.0) | **37.6 (33.1–120.1) [1 failed]** |  | blocked |

**Git push 15 minutes later: seconds from `git push` until the new code serves**

| App | Stacktape | Serverless | SST | AWS CDK | Render | Heroku | Ravion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `lambda-1` | pending | **55.4 (47.2–60.9)** | 58.1 (48.5–65.4) | 55.5 (49.9–63.4) |  |  |  |
| `lambda-5` | **30.9 (30.4–35.2), n=3** | 64.4 (55.6–99.4) | 60.4 (45.3–66.6) | 59.8 (49.9–69.8) |  |  |  |
| `lambda-25` | **33.2 (32.9–34.7), n=3** | 118.4 (110.3–139.9) | 75.4 (62.7–84.4) | 105.0 (68.2–134.7) |  |  |  |
| `container-node` | 56.1 (50.1–60.1), n=4 |  | 97.5 (86.0–116.1) | 109.6 (97.0–122.1) | 39.6 (31.1–70.1) | **37.0 (33.0–76.1)** | pending |
| `container-python` | pending |  | 96.1 (86.0–115.1) | 105.1 (96.0–116.1) | 55.1 (36.1–88.1) | **29.0 (27.0–34.0)** | pending |
| `five-services` | pending |  | 115.0 (106.0–134.1) | 112.1 (100.0–130.0) | **38.6 (34.1–85.1)** |  | blocked |

**Reading the results:**

- **Deploy time is time until the new code serves, not until the command exits.** Each run also records the
  command's own duration as `commandMs`. Stacktape's default web service (an HTTP API in front of the container, with
  no health check) serves the new code after about 40 seconds, but `stacktape deploy` exits only after about 185
  seconds, when ECS has finished the rolling deployment (median `commandMs`: 184.5 s for `container-node`, 194.2 s for
  `container-python`, 203.1 s for `five-services`). SST does the opposite: `sst deploy` starts the ECS update and
  exits after about 8 seconds, before the new task serves.
- **Stacktape's shared change on `lambda-5` and `lambda-25`** goes through a CloudFormation update. A change to the
  shared package changes Stacktape's shared chunk layer, which its direct code update does not handle yet, so these
  runs take 30–38 seconds instead of about 10.
- **SST's failed runs** happened between 14:56 and 14:58 UTC, when the machine's `/tmp` was full. SST's Pulumi engine
  leaves a 22 MB `pulumi-asset-*` file in `/tmp` on every deploy, and we deleted the old files during the run.
  The runs are kept, and make-up runs brought each series to 10.
- **Render's failed run** on `five-services`: the `webhooks` service returned HTTP 404 during the first run, about ten
  minutes after the service had been recreated.
- **Render deployed from a second copy of the fork.** Render's GitHub app had no access to our fork, so the Render
  services deployed the same branches and commits from another repository the app could see.

### Stacktape Git push runs

These separate qualification samples ran on 17–18 October 2026 through the **dev Console**, with workloads in
`eu-west-1`. They use CLI commit `16d16c8ed97e95c8129f684cbf143341da29bbf5`, version
`4.0.0-bench.16d16c8e`, baked into test AMI `ami-01572ab71483bcc1e` (build `bmk-push-36c3460d`). No npm publication
was needed. Other tools' numbers and the CLI-only Stacktape results above retain their original revisions and machines.
The observer was WSL on an i7-13700K; builds ran on a `c7a.2xlarge` runner with a persistent cache disk in the
connected AWS account, not on the observer or the other qualification run's `c7i.2xlarge`.

A push to the project's connected GitHub branch triggers the Console runner. **Cold** means its instance, cache disk
and database runner record were removed before the push. **Warm** is the paired push 15 minutes after readiness;
the logs confirm that every included warm sample reused a **running** instance. The idle timer starts after the job
finishes, which can be much later than readiness for containers. The separate **resume** samples waited for the
runner to become stopped through idle hibernation before pushing; they reuse its disk and caches.

Only rows with `at >= 2026-10-17T22:00Z` count. Rounds 1–10 used a WSL monotonic clock that ran approximately 9% fast,
inflating elapsed readiness by roughly 12–22 seconds on cold pushes. All 60 rows remain in
[`results/deploy-stacktape-push.jsonl`](results/deploy-stacktape-push.jsonl), marked with an `excluded` reason, and
are omitted from medians and phase summaries. The surviving rerun stopped before reaching ten samples; it contains
4 cold/3 warm Lambda samples per app and 5 cold/4 warm container samples. No additional rounds were collected.

**Stacktape Git push: seconds until new code serves, median (min–max), valid n**

| App | Cold | Warm, still running | Resume after hibernation |
| --- | --- | --- | --- |
| `lambda-5` | 226.9 (220.5–231.9), n=4 | 30.9 (30.4–35.2), n=3 | 50.3 (48.4–51.7), n=3 |
| `lambda-25` | 220.7 (125.8–240.4), n=4 | 33.2 (32.9–34.7), n=3 | 53.9 (51.2–54.9), n=3 |
| `container-node` | 254.2 (166.2–266.2), n=5 | 56.1 (50.1–60.1), n=4 | 85.1 (69.2–93.1), n=3 |

The nine resume samples are preserved verbatim in
[`results-extra/resume.jsonl`](results-extra/resume.jsonl). Their collector saved readiness and runner state,
but did not persist the main harness's `businessOk`/`unchangedOk` flags; they are reported separately rather than
silently treated as fully checked deploy rows. Cold and warm rows all passed those two checks.

**Runner phase breakdown, cold samples: median seconds (min–max)**

CloudWatch timestamps provide the phase boundaries, with about one-second log resolution. The last column combines
the readiness observer with the runner timestamp. Medians of individual phases need not sum to the median total.

| App | n | Push → Console queue | Queue → runner ready | Ready → job | Job → install | Install → CLI | CLI → serving |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `lambda-5` | 4 | 4.9 (3.7–15.3) | 173.5 (156.1–180.5) | 2.3 (2.2–2.3) | 21.0 (21.0–21.0) | 8.0 (8.0–8.0) | 17.4 (16.5–17.9) |
| `lambda-25` | 4 | 7.2 (4.7–16.8) | 158.3 (64.4–185.2) | 2.2 (2.2–5.3) | 21.0 (21.0–23.0) | 8.0 (8.0–8.0) | 18.9 (18.5–19.4) |
| `container-node` | 5 | 3.8 (3.6–8.9) | 157.7 (68.7–180.5) | 2.2 (1.9–2.2) | 21.0 (21.0–22.0) | 2.0 (2.0–2.0) | 51.6 (45.9–68.3) |

Warm queue-to-ready medians are 0.5 s; hibernation-resume medians are about 19–21 s. Warm job-to-install is 3 s,
versus 21 s cold. Lambda dependency installation takes 8 s cold and 5 s warm before the CLI starts. Cold CLI
Build & Package medians are 3.2 s (`lambda-5`), 4.8 s (`lambda-25`) and 11.7 s (`container-node`); warm medians are
1.9, 4.9 and 4.6 s. Container CLI completion takes about 207 s, although new code serves about 45–52 s after CLI start.
That ECS settling time is not added to readiness.

The largest optimization candidates, based on these samples and the earlier agents' log/code diagnosis, are:

1. **Fix runner IAM propagation and SSM retry startup.** Eleven of the 13 valid cold samples took 161–190 s from
   push to runner-ready, versus 71–72 s for the two fast samples. Earlier log diagnosis attributes about 95 s of the
   slow path to a fresh instance profile reaching SSM late, backing off, and an instance restart. Avoiding that retry
   is the largest cold-start opportunity; this is an estimate, not a measured optimized implementation.
2. **Keep runner tools ready without loading unused images.** Cold job-to-install is 21 s versus 3 s warm. Earlier
   diagnosis found a silent roughly 20 s `docker load` of the preseeded ~480 MB Railpack archive before checkout,
   even for Lambda jobs. Lazy or image-ready tool preparation could recover roughly 18–20 s; checkout itself was ~1 s.
3. **Remove the duplicate Lambda dependency install.** The runner installs dependencies, then the CLI's workspace
   detection installs them again during Initialize (~6.8–7.3 s). Reusing the completed install could save roughly 6 s
   per Lambda push. This needs implementation and fresh qualification before claiming a speedup.

These are prerelease qualification figures. Before using them as launch claims, rerun with the published CLI and
release runner image, verify the observer clock rate against AWS timestamps, and disclose actual running/stopped
state at the 15-minute push. The temporary test image and projects are removed after this qualification.

### Changes during the run

The harness was fixed three times while the series ran. Runs that a harness bug made wrong are not deleted: they are
in [`results/superseded.jsonl`](results/superseded.jsonl), each with the reason in `superseded`, and a make-up run or
rerun replaced each of them.

- **CDK's warm upload size** counted the asset directories of earlier synths left in `cdk.out` (61 MB instead of
  9.4 MB for `lambda-1`). Fixed in `3bde156`; the CDK warm packaging series was rerun (30 runs).
- **The business check** called each service once and could reach an old task during a rolling update. Fixed in
  `7e9ce35`, which gives a changed service up to a minute to answer from the new revision; the clock was not changed.
  21 SST and Render runs before the fix failed only this check.
- **Git push order:** the harness could push while the previous GitHub Actions deploy was still waiting for ECS, so
  CDK's next workflow found its stack in `UPDATE_IN_PROGRESS` and timed out. Fixed in `954bfb4`, which waits for the
  branch's previous workflow; two CDK container runs are superseded.

<details>
<summary>Full output of <code>node report.mjs --markdown</code></summary>

**Lambda packaging time and upload size**

| series | runs | failed | seconds: median (min–max) | MB: median (min–max) |
| --- | --- | --- | --- | --- |
| lambda-1 cdk clean | 10 | 0 | 3.0 (2.9–3.3) | 9.40 (9.40–9.40) |
| lambda-1 cdk warm | 10 | 0 | 3.0 (2.9–3.0) | 9.40 (9.40–9.40) |
| lambda-1 serverless clean | 10 | 0 | 5.2 (5.0–5.5) | 16.54 (16.54–16.54) |
| lambda-1 serverless warm | 10 | 0 | 5.1 (5.0–5.3) | 16.54 (16.54–16.54) |
| lambda-1 sst clean | 10 | 0 | 6.3 (6.2–6.5) | 33.67 (33.67–33.67) |
| lambda-1 sst warm | 10 | 0 | 6.4 (6.2–6.5) | 33.67 (33.67–33.67) |
| lambda-1 stacktape clean | 10 | 0 | 1.7 (1.7–1.7) | 6.64 (6.64–6.64) |
| lambda-1 stacktape warm | 10 | 0 | 1.7 (1.7–1.7) | 6.64 (6.64–6.64) |
| lambda-25 cdk clean | 10 | 0 | 11.4 (11.3–11.5) | 68.12 (68.12–68.12) |
| lambda-25 cdk warm | 10 | 0 | 11.4 (11.3–11.6) | 68.13 (68.13–68.13) |
| lambda-25 serverless clean | 10 | 0 | 19.5 (19.2–19.8) | 361.80 (361.80–361.80) |
| lambda-25 serverless warm | 10 | 0 | 19.6 (19.3–20.4) | 361.80 (361.80–361.80) |
| lambda-25 sst clean | 10 | 0 | 14.0 (13.7–14.3) | 515.47 (515.47–515.47) |
| lambda-25 sst warm | 10 | 0 | 14.7 (14.4–15.0) | 515.48 (515.48–515.48) |
| lambda-25 stacktape clean | 10 | 0 | 3.2 (3.1–3.2) | 6.73 (6.73–6.73) |
| lambda-25 stacktape warm | 10 | 0 | 3.2 (3.1–3.3) | 6.73 (6.73–6.73) |
| lambda-5 cdk clean | 10 | 0 | 4.4 (4.3–4.5) | 19.33 (19.33–19.33) |
| lambda-5 cdk warm | 10 | 0 | 4.4 (4.3–4.4) | 19.33 (19.33–19.33) |
| lambda-5 serverless clean | 10 | 0 | 7.0 (6.9–7.2) | 74.61 (74.61–74.61) |
| lambda-5 serverless warm | 10 | 0 | 7.0 (6.9–7.2) | 74.61 (74.61–74.61) |
| lambda-5 sst clean | 10 | 0 | 7.6 (7.5–8.0) | 115.81 (115.81–115.81) |
| lambda-5 sst warm | 10 | 0 | 7.8 (7.6–8.1) | 115.81 (115.81–115.81) |
| lambda-5 stacktape clean | 10 | 0 | 1.9 (1.8–1.9) | 6.71 (6.71–6.71) |
| lambda-5 stacktape warm | 10 | 0 | 1.9 (1.8–1.9) | 6.71 (6.71–6.71) |

**Container image size**

| series | runs | MB: median (min–max) |
| --- | --- | --- |
| container-node cdk | 1 | 86.60 (86.60–86.60) |
| container-node sst | 1 | 86.60 (86.60–86.60) |
| container-node stacktape | 1 | 63.35 (63.35–63.35) |
| container-python cdk | 1 | 54.69 (54.69–54.69) |
| container-python sst | 1 | 54.69 (54.69–54.69) |
| container-python stacktape | 1 | 53.44 (53.44–53.44) |

**Time from deploy start (or git push return) until the new code serves**

| series | runs | valid | excluded | seconds: median (min–max) |
| --- | --- | --- | --- | --- |
| container-node cdk cli handlers | 10 | 10 | 0 | 68.1 (60.0–78.1) |
| container-node cdk git-cold handlers | 10 | 10 | 0 | 108.1 (100.1–119.1) |
| container-node cdk git-warm handlers | 10 | 10 | 0 | 109.6 (97.0–122.1) |
| container-node cdk-hotswap cli handlers | 10 | 10 | 0 | 49.5 (36.0–64.1) |
| container-node heroku cli handlers | 10 | 10 | 0 | 28.0 (25.0–30.1) |
| container-node heroku git-cold handlers | 10 | 10 | 0 | 37.5 (34.0–42.0) |
| container-node heroku git-warm handlers | 10 | 10 | 0 | 37.0 (33.0–76.1) |
| container-node render git-cold handlers | 12 | 12 | 0 | 34.1 (28.1–116.1) |
| container-node render git-warm handlers | 10 | 10 | 0 | 39.6 (31.1–70.1) |
| container-node sst cli handlers | 10 | 10 | 0 | 138.6 (49.0–168.1) |
| container-node sst git-cold handlers | 10 | 10 | 0 | 417.2 (93.1–424.2) |
| container-node sst git-warm handlers | 10 | 10 | 0 | 97.5 (86.0–116.1) |
| container-node stacktape cli handlers | 10 | 10 | 0 | 40.1 (32.1–50.1) |
| container-node stacktape git-cold handlers | 15 | 5 | 10 | 254.2 (166.2–266.2) |
| container-node stacktape git-warm handlers | 14 | 4 | 10 | 56.1 (50.1–60.1) |
| container-python cdk cli handlers | 10 | 10 | 0 | 66.1 (61.0–85.1) |
| container-python cdk git-cold handlers | 10 | 10 | 0 | 101.1 (94.0–106.1) |
| container-python cdk git-warm handlers | 10 | 10 | 0 | 105.1 (96.0–116.1) |
| container-python cdk-hotswap cli handlers | 10 | 10 | 0 | 40.5 (36.0–58.1) |
| container-python heroku cli handlers | 10 | 10 | 0 | 21.6 (19.1–47.1) |
| container-python heroku git-cold handlers | 10 | 10 | 0 | 33.6 (29.1–38.1) |
| container-python heroku git-warm handlers | 10 | 10 | 0 | 29.0 (27.0–34.0) |
| container-python render git-cold handlers | 11 | 11 | 0 | 54.1 (45.1–74.1) |
| container-python render git-warm handlers | 11 | 11 | 0 | 55.1 (36.1–88.1) |
| container-python sst cli handlers | 11 | 10 | 1 | 96.6 (44.0–428.2) |
| container-python sst git-cold handlers | 10 | 10 | 0 | 410.7 (83.1–430.2) |
| container-python sst git-warm handlers | 10 | 10 | 0 | 96.1 (86.0–115.1) |
| container-python stacktape cli handlers | 10 | 10 | 0 | 47.6 (39.1–65.1) |
| five-services cdk cli handlers | 10 | 10 | 0 | 77.6 (72.1–86.1) |
| five-services cdk git-cold handlers | 10 | 10 | 0 | 117.0 (111.0–126.0) |
| five-services cdk git-warm handlers | 10 | 10 | 0 | 112.1 (100.0–130.0) |
| five-services cdk-hotswap cli handlers | 10 | 10 | 0 | 54.5 (46.0–58.0) |
| five-services heroku cli handlers | 10 | 10 | 0 | 30.5 (28.0–64.1) |
| five-services render git-cold handlers | 11 | 10 | 1 | 37.6 (33.1–120.1) |
| five-services render git-warm handlers | 10 | 10 | 0 | 38.6 (34.1–85.1) |
| five-services sst cli handlers | 11 | 10 | 1 | 73.0 (54.0–408.2) |
| five-services sst git-cold handlers | 10 | 10 | 0 | 273.1 (125.1–414.2) |
| five-services sst git-warm handlers | 10 | 10 | 0 | 115.0 (106.0–134.1) |
| five-services stacktape cli handlers | 10 | 10 | 0 | 57.6 (38.1–63.1) |
| lambda-1 cdk cli handlers | 10 | 10 | 0 | 20.7 (20.3–22.1) |
| lambda-1 cdk cli shared | 10 | 10 | 0 | 20.8 (20.2–21.3) |
| lambda-1 cdk git-cold handlers | 10 | 10 | 0 | 58.9 (53.7–66.1) |
| lambda-1 cdk git-warm handlers | 10 | 10 | 0 | 55.5 (49.9–63.4) |
| lambda-1 cdk-hotswap cli handlers | 10 | 10 | 0 | 11.4 (10.9–12.7) |
| lambda-1 cdk-hotswap cli shared | 10 | 10 | 0 | 11.6 (11.4–12.4) |
| lambda-1 serverless cli handlers | 10 | 10 | 0 | 19.8 (18.5–21.3) |
| lambda-1 serverless cli shared | 10 | 10 | 0 | 19.7 (19.2–20.6) |
| lambda-1 serverless git-cold handlers | 10 | 10 | 0 | 57.4 (47.1–61.5) |
| lambda-1 serverless git-warm handlers | 10 | 10 | 0 | 55.4 (47.2–60.9) |
| lambda-1 sst cli handlers | 10 | 10 | 0 | 13.8 (13.3–20.3) |
| lambda-1 sst cli shared | 12 | 10 | 2 | 13.6 (13.0–16.7) |
| lambda-1 sst git-cold handlers | 10 | 10 | 0 | 57.2 (49.8–64.3) |
| lambda-1 sst git-warm handlers | 10 | 10 | 0 | 58.1 (48.5–65.4) |
| lambda-1 stacktape cli handlers | 10 | 10 | 0 | 9.5 (8.8–11.1) |
| lambda-1 stacktape cli shared | 10 | 10 | 0 | 9.5 (9.1–9.9) |
| lambda-25 cdk cli handlers | 10 | 10 | 0 | 58.7 (38.9–66.9) |
| lambda-25 cdk cli shared | 10 | 10 | 0 | 58.4 (38.6–68.6) |
| lambda-25 cdk git-cold handlers | 10 | 10 | 0 | 102.8 (82.3–165.2) |
| lambda-25 cdk git-warm handlers | 10 | 10 | 0 | 105.0 (68.2–134.7) |
| lambda-25 cdk-hotswap cli handlers | 10 | 10 | 0 | 27.1 (26.0–28.4) |
| lambda-25 cdk-hotswap cli shared | 10 | 10 | 0 | 25.8 (24.8–27.9) |
| lambda-25 serverless cli handlers | 10 | 10 | 0 | 48.0 (45.9–66.3) |
| lambda-25 serverless cli shared | 10 | 10 | 0 | 46.7 (43.3–50.6) |
| lambda-25 serverless git-cold handlers | 10 | 10 | 0 | 127.8 (109.6–219.4) |
| lambda-25 serverless git-warm handlers | 10 | 10 | 0 | 118.4 (110.3–139.9) |
| lambda-25 sst cli handlers | 10 | 10 | 0 | 32.2 (25.4–33.3) |
| lambda-25 sst cli shared | 10 | 10 | 0 | 31.7 (29.3–33.2) |
| lambda-25 sst git-cold handlers | 10 | 10 | 0 | 72.0 (58.9–86.1) |
| lambda-25 sst git-warm handlers | 10 | 10 | 0 | 75.4 (62.7–84.4) |
| lambda-25 stacktape cli handlers | 10 | 10 | 0 | 11.9 (10.5–12.3) |
| lambda-25 stacktape cli shared | 10 | 10 | 0 | 37.7 (34.3–114.4) |
| lambda-25 stacktape git-cold handlers | 14 | 4 | 10 | 220.7 (125.8–240.4) |
| lambda-25 stacktape git-warm handlers | 13 | 3 | 10 | 33.2 (32.9–34.7) |
| lambda-5 cdk cli handlers | 10 | 10 | 0 | 22.4 (22.1–23.7) |
| lambda-5 cdk cli shared | 10 | 10 | 0 | 22.6 (22.2–23.5) |
| lambda-5 cdk git-cold handlers | 10 | 10 | 0 | 59.9 (51.9–69.0) |
| lambda-5 cdk git-warm handlers | 10 | 10 | 0 | 59.8 (49.9–69.8) |
| lambda-5 cdk-hotswap cli handlers | 10 | 10 | 0 | 13.4 (12.7–14.5) |
| lambda-5 cdk-hotswap cli shared | 10 | 10 | 0 | 13.2 (12.8–13.5) |
| lambda-5 serverless cli handlers | 10 | 10 | 0 | 23.1 (22.6–24.7) |
| lambda-5 serverless cli shared | 10 | 10 | 0 | 23.1 (22.3–108.2) |
| lambda-5 serverless git-cold handlers | 10 | 10 | 0 | 65.0 (58.0–93.7) |
| lambda-5 serverless git-warm handlers | 10 | 10 | 0 | 64.4 (55.6–99.4) |
| lambda-5 sst cli handlers | 10 | 10 | 0 | 14.9 (14.1–15.2) |
| lambda-5 sst cli shared | 10 | 10 | 0 | 14.8 (14.5–15.8) |
| lambda-5 sst git-cold handlers | 10 | 10 | 0 | 59.2 (53.9–63.4) |
| lambda-5 sst git-warm handlers | 10 | 10 | 0 | 60.4 (45.3–66.6) |
| lambda-5 stacktape cli handlers | 10 | 10 | 0 | 9.8 (7.2–10.5) |
| lambda-5 stacktape cli shared | 10 | 10 | 0 | 29.9 (28.9–31.1) |
| lambda-5 stacktape git-cold handlers | 14 | 4 | 10 | 226.9 (220.5–231.9) |
| lambda-5 stacktape git-warm handlers | 13 | 3 | 10 | 30.9 (30.4–35.2) |
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T16-19-24-688Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T16-19-24-683Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T16-19-24-687Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T16-19-24-688Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T16-19-24-683Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T16-19-24-687Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T16-43-30-053Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T16-43-30-057Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T16-43-30-055Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T16-43-30-053Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T16-43-30-057Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T16-43-30-055Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T17-07-53-633Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T17-07-53-633Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T17-07-53-634Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T17-07-53-633Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T17-07-53-633Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T17-07-53-634Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T17-31-33-927Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T17-31-33-937Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T17-31-33-926Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T17-31-33-927Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T17-31-33-937Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T17-31-33-926Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T17-54-32-207Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T17-54-32-208Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T17-54-32-206Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T17-54-32-207Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T17-54-32-208Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T17-54-32-206Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T18-18-19-841Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T18-18-19-849Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T18-18-19-841Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T18-18-19-849Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T18-18-19-841Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T18-18-19-841Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T18-41-02-340Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T18-41-02-340Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T18-41-02-340Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T18-41-02-340Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T18-41-02-340Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T18-41-02-340Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T19-05-15-706Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T19-05-15-705Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T19-05-15-707Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T19-05-15-706Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T19-05-15-705Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T19-05-15-707Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T19-28-09-441Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T19-28-09-435Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T19-28-09-434Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T19-28-09-441Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T19-28-09-435Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T19-28-09-434Z.log
- Excluded: lambda-5 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T19-51-59-376Z.log
- Excluded: lambda-25 stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T19-51-59-369Z.log
- Excluded: container-node stacktape git-cold handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T19-51-59-353Z.log
- Excluded: lambda-5 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-5-push-2026-10-17T19-51-59-376Z.log
- Excluded: lambda-25 stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-lambda-25-push-2026-10-17T19-51-59-369Z.log
- Excluded: container-node stacktape git-warm handlers run 1 (excluded: Rounds 1–10: WSL monotonic clock ran approximately 9% fast; readiness timings invalid. Valid series starts 2026-10-17T22:00Z.); log logs/bmk-stacktape-container-node-push-2026-10-17T19-51-59-353Z.log
- Excluded: lambda-1 sst cli shared run 1 (failed: Stopped waiting: the deploy command failed); log logs/bmk-sst-lambda-1-deploy-2026-10-17T14-56-45-510Z.log
- Excluded: five-services sst cli handlers run 1 (failed: Stopped waiting: the deploy command failed); log logs/bmk-sst-five-services-deploy-2026-10-17T14-57-54-158Z.log
- Excluded: container-python sst cli handlers run 1 (failed: Stopped waiting: the deploy command failed); log logs/bmk-sst-container-python-deploy-2026-10-17T14-57-56-426Z.log
- Excluded: lambda-1 sst cli shared run 1 (failed: Stopped waiting: the deploy command failed); log logs/bmk-sst-lambda-1-deploy-2026-10-17T14-58-12-043Z.log
- Excluded: five-services render git-cold handlers run 1 (failed: webhooks: HTTP 404); log logs/bmk-render-five-services-push-2026-10-17T15-00-22-358Z.log

**Stacktape Git push after verified hibernation (separate samples)**

| series | runs | seconds: median (min–max) |
| --- | --- | --- |
| container-node stacktape git-resume | 3 | 85.1 (69.2–93.1) |
| lambda-25 stacktape git-resume | 3 | 53.9 (51.2–54.9) |
| lambda-5 stacktape git-resume | 3 | 50.3 (48.4–51.7) |

</details>

## Test branches

<!-- generated:branches -->

| Branch | Application | Tool | Measured |
| --- | --- | --- | --- |
| [`lambda-1/stacktape`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-1/stacktape) | `lambda-1` | Stacktape | packaging, deploy from a laptop, Git push |
| [`lambda-5/stacktape`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-5/stacktape) | `lambda-5` | Stacktape | packaging, deploy from a laptop, Git push |
| [`lambda-25/stacktape`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-25/stacktape) | `lambda-25` | Stacktape | packaging, deploy from a laptop, Git push |
| [`container-node/stacktape`](https://github.com/stacktape/deploy-benchmarks/tree/container-node/stacktape) | `container-node` | Stacktape | image size, deploy from a laptop, Git push |
| [`container-python/stacktape`](https://github.com/stacktape/deploy-benchmarks/tree/container-python/stacktape) | `container-python` | Stacktape | image size, deploy from a laptop, Git push |
| [`five-services/stacktape`](https://github.com/stacktape/deploy-benchmarks/tree/five-services/stacktape) | `five-services` | Stacktape | deploy from a laptop, Git push |
| [`lambda-1/serverless`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-1/serverless) | `lambda-1` | Serverless Framework | packaging, deploy from a laptop, Git push |
| [`lambda-5/serverless`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-5/serverless) | `lambda-5` | Serverless Framework | packaging, deploy from a laptop, Git push |
| [`lambda-25/serverless`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-25/serverless) | `lambda-25` | Serverless Framework | packaging, deploy from a laptop, Git push |
| [`lambda-1/sst`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-1/sst) | `lambda-1` | SST | packaging, deploy from a laptop, Git push |
| [`lambda-5/sst`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-5/sst) | `lambda-5` | SST | packaging, deploy from a laptop, Git push |
| [`lambda-25/sst`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-25/sst) | `lambda-25` | SST | packaging, deploy from a laptop, Git push |
| [`container-node/sst`](https://github.com/stacktape/deploy-benchmarks/tree/container-node/sst) | `container-node` | SST | image size, deploy from a laptop, Git push |
| [`container-python/sst`](https://github.com/stacktape/deploy-benchmarks/tree/container-python/sst) | `container-python` | SST | image size, deploy from a laptop, Git push |
| [`five-services/sst`](https://github.com/stacktape/deploy-benchmarks/tree/five-services/sst) | `five-services` | SST | deploy from a laptop, Git push |
| [`lambda-1/cdk`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-1/cdk) | `lambda-1` | AWS CDK | packaging, deploy from a laptop, Git push |
| [`lambda-5/cdk`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-5/cdk) | `lambda-5` | AWS CDK | packaging, deploy from a laptop, Git push |
| [`lambda-25/cdk`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-25/cdk) | `lambda-25` | AWS CDK | packaging, deploy from a laptop, Git push |
| [`container-node/cdk`](https://github.com/stacktape/deploy-benchmarks/tree/container-node/cdk) | `container-node` | AWS CDK | image size, deploy from a laptop, Git push |
| [`container-python/cdk`](https://github.com/stacktape/deploy-benchmarks/tree/container-python/cdk) | `container-python` | AWS CDK | image size, deploy from a laptop, Git push |
| [`five-services/cdk`](https://github.com/stacktape/deploy-benchmarks/tree/five-services/cdk) | `five-services` | AWS CDK | deploy from a laptop, Git push |
| [`lambda-1/cdk-hotswap`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-1/cdk-hotswap) | `lambda-1` | AWS CDK with hotswap | packaging, deploy from a laptop |
| [`lambda-5/cdk-hotswap`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-5/cdk-hotswap) | `lambda-5` | AWS CDK with hotswap | packaging, deploy from a laptop |
| [`lambda-25/cdk-hotswap`](https://github.com/stacktape/deploy-benchmarks/tree/lambda-25/cdk-hotswap) | `lambda-25` | AWS CDK with hotswap | packaging, deploy from a laptop |
| [`container-node/cdk-hotswap`](https://github.com/stacktape/deploy-benchmarks/tree/container-node/cdk-hotswap) | `container-node` | AWS CDK with hotswap | image size, deploy from a laptop |
| [`container-python/cdk-hotswap`](https://github.com/stacktape/deploy-benchmarks/tree/container-python/cdk-hotswap) | `container-python` | AWS CDK with hotswap | image size, deploy from a laptop |
| [`five-services/cdk-hotswap`](https://github.com/stacktape/deploy-benchmarks/tree/five-services/cdk-hotswap) | `five-services` | AWS CDK with hotswap | deploy from a laptop |
| [`container-node/render`](https://github.com/stacktape/deploy-benchmarks/tree/container-node/render) | `container-node` | Render | Git push |
| [`container-python/render`](https://github.com/stacktape/deploy-benchmarks/tree/container-python/render) | `container-python` | Render | Git push |
| [`five-services/render`](https://github.com/stacktape/deploy-benchmarks/tree/five-services/render) | `five-services` | Render | Git push |
| [`container-node/heroku`](https://github.com/stacktape/deploy-benchmarks/tree/container-node/heroku) | `container-node` | Heroku | deploy from a laptop, Git push |
| [`container-python/heroku`](https://github.com/stacktape/deploy-benchmarks/tree/container-python/heroku) | `container-python` | Heroku | deploy from a laptop, Git push |
| [`five-services/heroku`](https://github.com/stacktape/deploy-benchmarks/tree/five-services/heroku) | `five-services` | Heroku | deploy from a laptop |
| [`container-node/ravion`](https://github.com/stacktape/deploy-benchmarks/tree/container-node/ravion) | `container-node` | Ravion | Git push |
| [`container-python/ravion`](https://github.com/stacktape/deploy-benchmarks/tree/container-python/ravion) | `container-python` | Ravion | Git push |
| [`five-services/ravion`](https://github.com/stacktape/deploy-benchmarks/tree/five-services/ravion) | `five-services` | Ravion | Git push |

<!-- /generated:branches -->

## What we measured

The Lambda applications are the backend of a small online shop, built like many real Lambda backends: an npm
workspace whose functions all import a shared `service` package (Prisma with PostgreSQL, the AWS SDK, Stripe, Slack,
Google Sheets, OpenAI, email) and a shared `util` package. Most functions are queue workers and scheduled jobs; four
are HTTP APIs; one builds a PDF, an Excel workbook and a Word document. The 1- and 5-function applications are
subsets of the 25-function one. The container applications are small commerce APIs whose code does real work. All
of them are described in [`fixtures/README.md`](fixtures/README.md).

| Test | Applications | Tools |
| --- | --- | --- |
| Lambda packaging | `lambda-1`, `lambda-5`, `lambda-25` | Stacktape, Serverless Framework, SST, AWS CDK |
| Container image size | `container-node`, `container-python` | Stacktape, SST, AWS CDK |
| Deploy a change from a laptop | all of the above, plus `five-services` | the tools that deploy from the command line |
| Deploy a change by Git push, first push | all of the above | every tool |
| Deploy a change by Git push, 15 minutes later | same as the first push | every tool |

In the five-service application, the change edits three services. The other two must keep running their old code.
The Lambda applications have a second deploy test, the shared change: it edits a module of the shared `service`
package, which every function imports, so every function must be rebuilt.

## How a run works

**The change.** Every function and service has a small revision file, for example
[`create-order.revision.ts`](fixtures/lambdas/packages/functions/src/handlers/create-order.revision.ts). A deploy run
writes a new revision string into the revision file of every changed function or service. Every response from the
applications contains the revision of the code that produced it. All tools get the same change. The shared change
(`--change shared`) instead edits `serviceRevision` in
[`packages/service/src/orders.ts`](fixtures/lambdas/packages/service/src/orders.ts), which every Lambda response
reports. `--change mixed` edits that helper and every handler revision together. Its business check requires both
revisions to match.

**When a deploy counts as done.** The clock starts when the deploy command starts. For a Git push, it starts when
`git push` returns. The clock stops when every changed function or service has returned the new revision. Functions
are invoked every 250 ms and services are called every second. The clock does not wait for the command to exit; the
command's own duration is recorded separately. After the clock stops, every function and service must also return
the right business result (for example a cart total of `33.00`) from the expected revision. During a rolling update
a load balancer still sends some requests to the old code, so a changed service gets up to a minute to answer from
the new revision; the clock has already stopped. Runs that fail this check are kept in the raw data but left out of
the results.

**Packaging.** The clock covers the tool's own packaging command. Before each run we delete the tool's previous build
output. Every series starts with one run that is not measured, so nothing a tool downloads on first use is timed. The
"warm" series keeps the previous build and changes only the source, like a developer's next build.

**Container build time is part of the deploy, not packaging.** No tool builds a container image except as part of a
deploy, so the deploy test times each tool's whole deploy command, image build included; for containers, the
packaging test reports only the image size.

**Upload size.** For Lambda, this is everything the tool uploads as code: each function's ZIP, each layer it creates,
and the source maps it uploads next to the ZIPs (SST and Stacktape do this). For containers, it is the compressed
image size reported by the local Docker image store, which is what a push to an empty registry uploads. Heroku
reports a compressed slug instead of an image. Render does not report a size.

**Not measured.** Creating the infrastructure the first time, installing tools and dependencies, and the checks
after each run.

**Recorded for every run:** the tool and its version, the Stacktape commit when Stacktape is built from source, the
machine, the timings, the sizes and a log of every command.

## How each tool is set up

Every tool uses its documented defaults, except where noted in [Where a tool needed help](#where-a-tool-needed-help).
On AWS, every function uses Node.js 22 with 512 MB of memory and a 30-second timeout, and every container uses
0.25 vCPU and 512 MB on Fargate.

**Regions and instance sizes.** The AWS tools deploy to `eu-west-1` (Ireland), and the measuring machine runs there
too. Heroku apps run in Heroku's EU region, which is also in Ireland, and Render services in Frankfurt, Render's
closest region. Each Heroku app runs on one Basic dyno (512 MB, always on) and each Render service on one Starter
instance (0.5 CPU, 512 MB). These are the smallest always-on sizes of each platform, comparable to the 0.25 vCPU,
512 MB Fargate tasks. The npm tools are pinned in each project's `package.json` and `package-lock.json`. Render,
Heroku and Ravion choose their own build images, so they run whatever version the platform offers at the time of the
measurement. The exact files are in the test branches and in [`configs/`](configs); `node configs.mjs` regenerates
them from the tool modules in [`tools/`](tools).

### Stacktape

The container tests since 21 October opt into `web-service.properties.codeSwap: true`. This feature is off by
default. The services use amd64, no configured health check, and one task (at most two during a rollout). Since
[`028ef1a7`](https://github.com/stacktape/stacktape/commit/028ef1a78e30f30e4fd37c3f0c383f61842b1175), code swap also
covers the Python service, whose `requirements.txt` pins every package with hashes, and several services per stack; on
21 October Python and `five-services` still used image fallback. Every result records `codeSwapOptIn`, `deploymentMode` and the CLI's explanation. The 17 October image deployment
numbers remain in the original `results/` series. Compare the opt-in results separately; do not call a fallback a swap.


- Configuration: [`configs/stacktape/`](configs/stacktape), written by [`tools/stacktape.mjs`](tools/stacktape.mjs).
- Version: the CLI built from source at a commit that each result records. See
  [Build Stacktape from source](#build-stacktape-from-source).
- Packaging: `stacktape package`. Deploy: `stacktape deploy`.
- Functions and the Node.js services use Stacktape's `js-bundle` packaging. The Python service uses `buildpack`.
- `stacktape deploy` updates code-only changes directly, without a CloudFormation update. This is its default.
- Git push: Stacktape Console's Git integration, which deploys on the project's runner in your AWS account (a
  c7a.2xlarge EC2 instance with a cache disk). [Stacktape Git push runs](#stacktape-git-push-runs) describes what the
  first push and the push 15 minutes later find on the runner.

### Serverless Framework

- Configuration: [`configs/serverless/`](configs/serverless), written by [`tools/serverless.mjs`](tools/serverless.mjs).
- Version: 4.44.0.
- Packaging: `serverless package`. Deploy: `serverless deploy`.
- The Serverless service is the monorepo's `packages/functions` package, where its `serverless.yml` lives. That is
  the usual layout, and Serverless installs `external` packages at the versions in that package's `package.json`.
- Version 4 with its built-in esbuild bundling (`build.esbuild`), with esbuild's default options. Without that
  setting, version 4 bundles only TypeScript handlers. We turned it on because most Serverless projects bundle their
  code. In the last month, the [`serverless`](https://www.npmjs.com/package/serverless) package had 5.9 million
  downloads, [`serverless-esbuild`](https://www.npmjs.com/package/serverless-esbuild) 2.0 million,
  [`serverless-webpack`](https://www.npmjs.com/package/serverless-webpack) 1.0 million and
  [`serverless-plugin-typescript`](https://www.npmjs.com/package/serverless-plugin-typescript) 0.5 million. Weekly,
  [version 3 had 681,000 downloads and version 4 had 511,000](https://www.npmjs.com/package/serverless?activeTab=versions)
  (October 2026).
- `build.esbuild.buildConcurrency: 8`, the benchmark machine's vCPU count. By default Serverless builds and zips all
  functions at once. For the 25-function app that peaked at about 19 GB of memory, more than the 16 GB machine has,
  so the machine swapped. With 8 parallel builds it peaked at about 9 GB. Bundling is CPU-bound, so running more
  parallel builds than the machine has vCPUs does not finish sooner. [Serverless's build guide](https://www.serverless.com/framework/docs/providers/aws/guide/building)
  documents this setting for limiting concurrency. It changes nothing for the 1- and 5-function apps. The 21 October
  `lambda-25` Serverless results were measured with the default; the 22 October rerun uses this setting, and the whole
  machine then peaked at 11.5 GB.
- `serverless deploy function` is faster for a single function, but it is a separate command and skips
  CloudFormation, so we use `serverless deploy`.
- Git push: GitHub Actions, using the
  [shared workflow](configs/serverless/lambda-5/.github/workflows/deploy.yml). Serverless Framework v4 has no Git
  deployment service of its own.

### SST

- Configuration: [`configs/sst/`](configs/sst), written by [`tools/sst.mjs`](tools/sst.mjs).
- Version: 4.17.2.
- Deploy: `sst deploy`. Functions use `sst.aws.Function`; services use `sst.aws.Service` on an SST cluster.
- Packaging: SST has no command that only packages. `sst diff` on a deployed stage builds and zips every function,
  then compares the plan with what is deployed. Its time therefore includes that comparison, which reads from AWS.
- Containers are built from a plain [Dockerfile](configs/sst/container-node/Dockerfile): the official slim image, a
  locked production install, then the source. SST runs `docker build` during `sst deploy`; for the image size, the
  packaging test runs the same `docker build` directly.
- Git push: the [shared GitHub Actions workflow](configs/sst/lambda-5/.github/workflows/deploy.yml). SST's own
  Autodeploy needs an SST Console account and is not measured.

### AWS CDK

- Configuration: [`configs/cdk/`](configs/cdk), written by [`tools/cdk.mjs`](tools/cdk.mjs).
- Version: CDK CLI 2.1145.0 with aws-cdk-lib 2.273.0, constructs 10.8.1 and esbuild 0.28.2.
- Deploy: `cdk deploy`. Functions use `NodejsFunction`; services use `ApplicationLoadBalancedFargateService`.
- Packaging: `cdk synth`, which bundles each function with esbuild (installed in the project, as CDK recommends).
  CDK zips the bundles later, during `cdk deploy`, so zipping is not part of CDK's packaging time. For the upload
  size we zip each bundle at the same compression level CDK uses.
- Containers use the same Dockerfile as SST, and the image size comes from the same direct `docker build`.
- Git push: the [shared GitHub Actions workflow](configs/cdk/lambda-5/.github/workflows/deploy.yml).
- **CDK with hotswap** is reported as a separate tool, with its own branches (`<app>/cdk-hotswap`).
  `cdk deploy --hotswap` updates Lambda code and ECS services directly, which is CDK's fast path for code changes.
  CDK documents it for development stacks only, because it leaves the CloudFormation stack out of date. Its first
  deploy is a normal `cdk deploy`. It has no Git push test.

### Render

- Configuration: [`configs/render/`](configs/render), written by [`tools/render.mjs`](tools/render.mjs).
- Render's native Node.js and Python runtimes on Starter instances in Frankfurt, with the build and start commands
  from Render's Express and FastAPI guides.
- Render deploys only from a Git repository, so it has no laptop deploy. Build time comes from Render's build events.
- `node bench.mjs setup` creates the services of `render.yaml` through the Render API. The first push of each pair
  starts with "Clear build cache & deploy" of the previous commit, through the API, and waits until it is live.

### Heroku

- [`tools/heroku.mjs`](tools/heroku.mjs). No extra configuration: the applications already have a `Procfile` and
  runtime version files.
- The default stack and the official Node.js and Python buildpacks. Each service is its own Heroku app, in the EU
  region, on one Basic dyno.
- Laptop deploy: `git push` to Heroku's Git remote. Git push: Heroku's GitHub integration with automatic deploys.
- Heroku builds the repository root. For the five-service application we push each service with `git subtree push`,
  and its GitHub integration cannot deploy it.

### Ravion

- The Ravion infrastructure was deleted on 18 Oct 2026 and must be recreated before measuring.
- [`tools/ravion.mjs`](tools/ravion.mjs). Ravion's configuration lives in the Ravion project, not in the test branch.
  Railpack detects the runtime, dependencies and start command from the source.
- Ravion deploys only from a Git repository, so it has no laptop deploy. Build time and image size come from the
  build step of Ravion's pipeline runs and from ECR.
- One Ravion project (`bmk`) with one environment (`bench`) in `eu-west-1`, set up as in Ravion's
  [Node.js guide](https://www.ravion.com/docs/deploy/aws/node-express) with the current module versions:
  - `rvn-aws-network` 1.2.1 with its defaults (three subnet pairs, one NAT gateway).
  - `rvn-ecs-cluster` 2.2.0 with `use_ravion_managed_domains: true` and `load_balancer_deletion_protection_enabled: false`.
  - One `rvn-ecs-web` 2.3.0 per service: `build_source: railpack`, `source_repo: github.com/<you>/deploy-benchmarks`,
    `container_port: 3000`, `health_check_path: /health`, `fargate_size: {vcpu: 0.25, memory_gb: 0.5}`
    and `build_capacity_type: ec2-spot`. The module and service names are `container-node`/`bmk-container-node`,
    `container-python`/`bmk-container-python`, and for five services `five-services-<service>`/`bmk-fs-<service>` with
    `source_base_path: <service>`. Every other input keeps its default, including Railpack's commands, autoscaling
    from one task and rolling deploys.
  - One pipeline per service, with the module's given ID: a `build` step with `branch` and `ref` from the push, then a
    `deploy` step with the build's `image_digest`, and a `webhook:github` push trigger filtered to the test's branch
    (and, for five services, `paths: ['<service>/**']`).
  - The project's Terraform change and destroy pipelines are copies of Ravion's system pipelines with
    `infrastructure: {type: ec2, instance_size: c7a.large}` instead of sandboxes. They only create the
    infrastructure, which is not measured.
- The five-service application does not build on Ravion yet. Ravion's EC2 builder applies `source_base_path` twice
  (`directory .../api/api does not exist`), so a service in a subdirectory cannot be built with Railpack.

## Where a tool needed help

| What | Tools | Why |
| --- | --- | --- |
| Keep `pdfkit` out of the bundle and install it as a package: `build.esbuild.external` (Serverless), `nodejs.install` (SST), `bundling.nodeModules` (CDK) | Serverless Framework, SST, AWS CDK | PDFKit reads its font files from disk. Bundled, the sales report fails with `ENOENT ... Helvetica.afm`. We checked that each of these tools fails without the setting. Stacktape detects such packages itself. Serverless applies `external` to every function, so each function's ZIP contains PDFKit. |
| `package.individually: true` | Serverless Framework | By default all functions share one ZIP. For 25 functions that ZIP holds every bundle and source map, over 600 MB unpacked; Lambda accepts at most 250 MB. |
| `build.esbuild.buildConcurrency: 8` | Serverless Framework | By default Serverless builds and zips all functions at once. For 25 functions that needs about 19 GB of memory, more than the 16 GB benchmark machine has, and the machine swaps. Eight, the machine's vCPU count, peaks at about 9 GB. |
| An esbuild `banner` that defines `require` | Serverless Framework | Serverless bundles this ES module project to an ES module, where CommonJS dependencies (ExcelJS, among others) cannot `require` Node.js built-ins. The import uses a distinct alias so it cannot collide with dependencies that also import `createRequire`. The banner is the fix in [Serverless's build guide](https://www.serverless.com/framework/docs/providers/aws/guide/building). Stacktape bundles to CommonJS and needs no setting. |
| Load balancer health check path `/health` | SST, AWS CDK | The default path `/` returns 404 in these applications, so the services would never become healthy. |
| A Dockerfile | SST, AWS CDK | Both need one to build a container. Stacktape, Render, Heroku and Ravion build from the source. |
| `--awsAccount` | Stacktape | Stacktape deploys with credentials from the Stacktape Console for a connected AWS account, not with `AWS_PROFILE`. |
| ES module output (`bundling.format: OutputFormat.ESM`) with a `banner` that defines `require` | AWS CDK | Prisma's generated client reads `import.meta.url`, which CDK's default CommonJS bundle leaves empty, so every function failed when Lambda loaded it. This is the same fix as Serverless's banner. |
| EC2 Spot builders (`build_capacity_type: ec2-spot`) instead of the default sandbox builders, and Terraform pipelines on EC2 | Ravion | Ravion's default since 12 October 2026 runs builds and Terraform in Firecracker sandboxes on a pool of EC2 hosts. In our Ravion organization every sandbox host is refused at enrollment (`Ravion:SandboxHost:ENROLLMENT_REJECTED`, "this organization has no machine-identity application to issue a host credential on"), so no build or Terraform run ever starts. Updating the AWS permissions to 1.0.55 did not help. Each build now starts a new c7a.4xlarge Spot instance; in our first build, about 110 seconds passed before the build itself began. A warm sandbox host starts a build in seconds, so Ravion's build times here are slower than its default would be. |
| Ravion-managed domains (`use_ravion_managed_domains: true`) | Ravion | The Node.js guide's configuration fails validation with the current cluster module, whose public load balancer uses HTTPS and needs a certificate. Ravion-managed domains give each service an HTTPS address under `cluster.ravion.app` without one. |

**Left at each tool's default:** the AWS SDK and Prisma. Stacktape, Serverless Framework and AWS CDK all leave
`@aws-sdk/*` out of the bundle, because the Node.js 22 Lambda runtime provides it, and bundle Prisma's client, whose
query compiler is plain JavaScript and WebAssembly in Prisma 7. `prisma generate` runs on `npm ci` for every tool.

## Known limitations

- **Stacktape does not have to win.** The published results will show every test where another tool is faster or
  smaller. Source maps count toward the upload size of the tools that upload them (SST and Stacktape), and AWS CDK
  uploads none by default.
- **The tools roll out changes differently.** Serverless Framework and AWS CDK go through CloudFormation. Stacktape
  and CDK with hotswap update code directly. SST uses Pulumi. Render, Heroku and Ravion run their own pipelines. We
  measure each tool's normal path; the guarantees are not the same.
- **First response.** A service counts as updated at its first response from the new code. During a rolling update,
  some requests can still reach the old code for a short time.
- **SST's packaging time** includes the plan comparison of `sst diff`, because SST has no packaging-only command.
- **CDK's and Stacktape's packaging times** do not include zipping that happens only during deploy (CDK's function
  bundles, Stacktape's shared layers). Their upload sizes do include those ZIPs.
- **Hosted builders.** Render and Heroku build on the provider's machines, so their build times depend on the
  provider's capacity. Ravion builds on EC2 Spot instances in the connected account, which depend on Spot capacity.
  Render has no way to empty only the build cache, so its first-push runs need a manual cache reset.
- **One machine, one region, one period.** The results describe this setup, not every project.

## Run the benchmark

Use `BENCH_RESULTS_DIR=results/2026-10-22` for the current qualification (`results/2026-10-21` for the previous one),
including when running `report.mjs`. Every packaging and deploy run records the machine's peak memory, peak swap and
the pages swapped in and out while it ran, in its `memory` field. On EC2, define the AWS profile with only a `region`,
so every tool falls back to the instance role; SST rejects a profile that uses `credential_source`.
`stacktape deploy` and `delete` use the explicit `--awsAccount` connection. `stacktape package` rejects that option
and uses local AWS credentials, so the harness passes `--profile "$AWS_PROFILE"` explicitly instead.
The original `results/` files retain the 17 October fixture and image-deploy measurements. The Lambda fixture changed
on 21 October: shared service/util packages now exercise search serialization, Drive/Calendar request construction,
Sentry scope context, international phone/country normalization and numerical statistics. Every handler also renders
HTML and CSV/XML records through real npm libraries; the four email handlers use MJML for responsive messages. These paths execute and are checked; there are no ballast files.
The larger backend represents applications with more integrations and document processing. It also tests the tradeoff
between a shared layer and duplicated per-function bundles. The same source and dependency versions go to every tool,
and results are reported even where Stacktape loses. See [fixture details](fixtures/README.md).


Run on a dedicated machine in `eu-west-1`, the region of the deployments; we use EC2. Image sizes need Docker's
containerd image store, the default of Docker Desktop and Docker Engine 29; the older overlay2 store reports
unpacked sizes, so the harness refuses it. Everything the benchmark
creates is named `bmk-*`. Install the harness's own dependency (the AWS SDK, to invoke functions) and set the
credentials from the [table above](#reproduce-one-test):

```sh
npm ci
export AWS_PROFILE=...
```

Tools are `stacktape`, `serverless`, `sst`, `cdk`, `cdk-hotswap`, `render`, `heroku` and `ravion`. Applications are
`lambda-1`, `lambda-5`, `lambda-25`, `container-node`, `container-python` and `five-services`.

```sh
node bench.mjs setup   sst lambda-5                         # write the project and deploy it (not measured)
node bench.mjs package sst lambda-5 --runs 10               # package from an empty build cache
node bench.mjs package sst lambda-5 --runs 10 --warm        # package after a source change
node bench.mjs package sst container-node                   # container image size
node bench.mjs deploy  sst lambda-5 --runs 10               # deploy a code change from this machine
node bench.mjs deploy  sst lambda-5 --runs 10 --change shared   # change the shared service package instead
node bench.mjs remove  sst lambda-5                         # delete everything setup created
node report.mjs                                             # median, fastest and slowest run of every series
```

`setup` writes the test's branch to `work/bmk-<tool>-<app>/` as its own Git repository, with the same commit as the
published branch, and installs its locked dependencies. Command logs are in `logs/`. SST's function packaging needs
a deployed stage, so run `setup` first. To spread network and AWS variation evenly, run one round of every tool
before the next round:

```sh
for round in $(seq 10); do
  for tool in stacktape serverless sst cdk cdk-hotswap; do node bench.mjs deploy $tool lambda-25 --runs 1; done
done
```

### Build Stacktape from source

The published results use a Stacktape CLI built from source. Each result records the commit in `stacktapeCommit`.

```sh
git clone https://github.com/stacktape/stacktape && cd stacktape
git checkout 028ef1a78e30f30e4fd37c3f0c383f61842b1175   # the commit in tools/stacktape.mjs
pnpm install --frozen-lockfile
pnpm turbo run build --filter=@stacktape/init-ui
cd apps/cli
bun scripts/build-dist-package.ts --platform linux --version 4.0.0-bench.$(git rev-parse --short=8 HEAD) --keepUnarchived
export STACKTAPE_BIN=$PWD/__dist/linux/stacktape
```

This is the build the release workflow makes, with Node.js 24.15, pnpm 11.17 and Bun 1.4.1. The harness checks that
the version of `STACKTAPE_BIN` ends in the pinned commit.

### Git push runs

`node bench.mjs push <tool> <app> --runs 5` commits a change to the project in `work/`, pushes it to the test's
branch on the project's `origin` remote and measures until the new code answers. Each run is a pair: a first push
with an empty build cache, then a second push 15 minutes after the first one finished.

You need a fork of this repository with all branches (untick "Copy the main branch only"), because the platforms
deploy from your fork's branch. The project that `setup` writes has the same commit as the published branch, so its
pushes continue your fork's branch. Set `BENCH_FORK` before `setup`, which adds the fork as the project's `origin`:

```sh
export BENCH_FORK=https://github.com/<you>/deploy-benchmarks
```

GitHub doesn't run workflows in a new fork until you turn them on in its Actions tab. The AWS role for the workflows
must trust the fork's OIDC subject. New repositories get immutable subjects such as
`repo:<you>@<owner id>/deploy-benchmarks@<repository id>:ref:refs/heads/<branch>`;
`gh api repos/<you>/deploy-benchmarks/actions/oidc/customization/sub` shows the prefix.

Then connect the deploy service to your fork's branch. Each test branch's README has these steps for its
application:

<!-- generated:git-push-setup -->

**Stacktape**

- Deploy the test's branch once with `stacktape deploy` from a terminal and answer yes to "Set up automatic deployments on push". This connects the repository and the test's branch to the project with the stage `bmk` in `eu-west-1`. Stacktape's GitHub app must have access to the repository.
- Every push then deploys on the project's runner in your AWS account: an EC2 instance with a cache disk, launched for the first push and hibernated after 15 idle minutes. The runner installs the Stacktape version set for the project in the Console from npm unless its image already contains that version. A build from source is not on npm; the main README describes how we measured one.
- To empty the runner's caches before each first push, remove the project's runner (its instance, cache disk and record) and pass `--cold-reset manual`. The Console can't do this yet; see the main README.

**Serverless Framework**

- Turn on GitHub Actions in your fork. This branch's `.github/workflows/deploy.yml` deploys every push to the branch.
- Add the repository secrets `AWS_ROLE_ARN` and `SERVERLESS_ACCESS_KEY`. `AWS_ROLE_ARN` is a role in the disposable account that the fork can assume through GitHub OIDC.
- Sign `gh` in to an account that can manage the fork's Actions caches (`gh auth login` or `GH_TOKEN`). The first push of each pair deletes them with `gh cache delete --all`.

**SST**

- Turn on GitHub Actions in your fork. This branch's `.github/workflows/deploy.yml` deploys every push to the branch.
- Add the repository secret `AWS_ROLE_ARN`. `AWS_ROLE_ARN` is a role in the disposable account that the fork can assume through GitHub OIDC.
- Sign `gh` in to an account that can manage the fork's Actions caches (`gh auth login` or `GH_TOKEN`). The first push of each pair deletes them with `gh cache delete --all`.

**AWS CDK**

- Turn on GitHub Actions in your fork. This branch's `.github/workflows/deploy.yml` deploys every push to the branch.
- Add the repository secret `AWS_ROLE_ARN`. `AWS_ROLE_ARN` is a role in the disposable account that the fork can assume through GitHub OIDC.
- Sign `gh` in to an account that can manage the fork's Actions caches (`gh auth login` or `GH_TOKEN`). The first push of each pair deletes them with `gh cache delete --all`.

**AWS CDK with hotswap**: no Git push test.

**Render**

- Install Render's GitHub app on your fork. With `BENCH_FORK` set, `node bench.mjs setup` creates the services of `render.yaml` through the Render API, deploying the test's branch of your fork on every push. A Blueprint created from `render.yaml` in the Render dashboard is the same.
- The first push of each pair starts with a "Clear build cache & deploy" of the previous commit through the Render API and waits until it is live.

**Heroku**

- `node bench.mjs setup` creates the Heroku app. In the Heroku dashboard, connect it to your fork and the test's branch, and turn on automatic deploys.
- The first push of each pair empties the build cache with `heroku builds:cache:purge`.

**Ravion**

- In Ravion, connect your AWS account, and install Ravion's GitHub app on your fork in Settings / Git connections.
- Create the Ravion project described in the main README: a network, an ECS cluster, one web module with the repository root as its source directory, and one pipeline that builds and deploys every push to the test's branch.
- Set the `RAVION_URL_*` variables to the service URLs.
- The first push of each pair empties the build cache: it deletes the `buildcache` and `railpack` tags from each changed service's ECR repository.

<!-- /generated:git-push-setup -->

For Render, Ravion and Heroku, connect the platform before `setup`: they deploy only from Git, and `setup` checks the
deployed services.

## Regenerate the configurations and branches

The test branches and [`configs/`](configs) are generated from [`tools/`](tools), [`fixtures/`](fixtures),
[`lib.mjs`](lib.mjs) and [`project.mjs`](project.mjs). Don't edit them by hand. After a change to those files:

```sh
node configs.mjs           # rewrite configs/, the pinned lockfiles and the generated parts of this README
git commit -am "..."       # the branches are generated from committed files
node branches.mjs --push   # rebuild every <app>/<tool> branch and force-push it
node branches.mjs --check  # confirm that every branch on GitHub matches main
```

`node configs.mjs` keeps the versions in each lockfile unless a pinned tool version changes. Each branch is a single
commit with a fixed author and date, so the same files always give the same commit, on any machine.
`node configs.mjs --check` and `node branches.mjs --check` change nothing and fail when something is out of date.

## Repository layout

| Path | What it is |
| --- | --- |
| [`bench.mjs`](bench.mjs) | The runner: `setup`, `package`, `deploy`, `push` and `remove` |
| [`lib.mjs`](lib.mjs) | The applications, the change, running commands, the probes, the shared Dockerfile and workflow |
| [`project.mjs`](project.mjs) | The project of each test: the files, the commit and the branch README |
| [`tools/`](tools) | One module per tool: its configuration, commands, artifacts, addresses and setup notes |
| [`configs/`](configs) | The files each tool adds to each application, with their lockfiles, generated by `node configs.mjs` |
| [`branches.mjs`](branches.mjs) | Generates the `<app>/<tool>` branches |
| [`report.mjs`](report.mjs) | Prints the median, fastest and slowest run of every series |
| [`fixtures/`](fixtures) | The test applications |

## Think a tool is set up badly?

We want each tool to look the way its users would set it up. If a configuration here is worse than what you would
use, or a measurement favors one tool, please open an issue in this repository. Tell us what you would change and,
if you can, link the documentation that supports it. We will rerun the affected tests.

## License

[MIT](LICENSE)
