# 22 October versus 21 and 17 October 2026

Seconds unless labelled MB. Each cell is median (minimum–maximum) of ten valid runs unless `n` says otherwise. The
22 October run measured every tool on the same machine in one session (21 Oct 21:00 UTC to 22 Oct 01:57 UTC).
Stacktape changed from source `1aba589f` (Lambda) and `b1ab2385` (containers) on 21 October to `028ef1a7`. The
competitor versions, the fixtures and the machine type did not change, except that Serverless now uses
`build.esbuild.buildConcurrency: 8`. The 21 October run did not measure competitor containers; their earlier numbers
are from 17 October, which used the smaller Lambda fixture and the same container fixtures.

Largest changes:

- Stacktape packaging: `lambda-5` 6.4 → 3.1 s and `lambda-25` 9.1 → 3.8 s. Bun's wrapper chunks no longer disable
  stable chunk names ([stacktape#256](https://github.com/stacktape/stacktape/pull/256)).
- Stacktape shared-package deploys: `lambda-5` 30.7 → 17.3 s and `lambda-25` 51.4 → 19.3 s. The same change keeps
  every function ZIP and publishes the new layer from its S3 object.
- Stacktape `container-python` 55.1 → 7.6 s and `five-services` 64.6 → 6.1 s. Code swap now covers Python and several
  services per stack ([stacktape#257](https://github.com/stacktape/stacktape/pull/257)); all 30 container runs swapped.
- Serverless `lambda-25`: packaging 204.7 → 28.4 s and handler deploy 361.9 → 56.7 s. The 21 October numbers were
  measured while the machine paged; with eight parallel builds Serverless peaked at about 11.5 GB of the 15.3 GB and
  did not page meaningfully.
- Competitor container deploys are within a few seconds of 17 October, except SST, whose 17 October series included a
  full `/tmp` and failed runs.

In the container tables, Stacktape's 21 and 22 October runs opt into code swap (`codeSwap: true`); its 17 October
runs are image deployments. Stacktape's 22 October image size was packaged with `codeSwap` removed, because
`stacktape package` fails when it is set (see the README).

## Lambda packaging, empty build cache: seconds

| App | Tool | 22 Oct | 21 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 2.3 (2.3–2.4) | 2.3 (2.2–2.3) |
| `lambda-1` | Serverless | 5.8 (5.7–5.8) | 5.7 (5.6–5.9) |
| `lambda-1` | SST | 7.2 (6.9–7.5) | 7.0 (6.9–7.3) |
| `lambda-1` | AWS CDK | 3.4 (3.3–3.4) | 3.3 (3.2–3.4) |
| `lambda-1` | CDK hotswap | 3.3 (3.2–3.5) | 3.3 (3.2–3.4) |
| `lambda-5` | Stacktape | 3.1 (3.1–3.2) | 6.4 (5.2–6.5) |
| `lambda-5` | Serverless | 9.7 (9.5–9.9) | 9.2 (9.1–9.4) |
| `lambda-5` | SST | 10.2 (10.0–10.6) | 9.6 (9.4–9.8) |
| `lambda-5` | AWS CDK | 6.0 (5.9–6.3) | 5.6 (5.5–5.7) |
| `lambda-5` | CDK hotswap | 5.7 (5.5–5.9) | 5.5 (5.5–5.6) |
| `lambda-25` | Stacktape | 3.8 (3.7–3.8) | 9.1 (8.0–9.3) |
| `lambda-25` | Serverless | 28.4 (28.0–29.2) | 204.7 (161.6–308.4) |
| `lambda-25` | SST | 23.9 (23.7–24.2) | 22.5 (22.2–23.3) |
| `lambda-25` | AWS CDK | 17.6 (17.4–17.6) | 16.6 (16.6–16.7) |
| `lambda-25` | CDK hotswap | 17.7 (17.3–17.9) | 16.6 (16.5–17.0) |

## Lambda packaging, source change: seconds

| App | Tool | 22 Oct | 21 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 2.3 (2.3–2.3) | 2.2 (2.2–2.3) |
| `lambda-1` | Serverless | 5.8 (5.6–6.0) | 5.7 (5.6–5.8) |
| `lambda-1` | SST | 7.2 (7.1–7.4) | 7.2 (7.0–7.6) |
| `lambda-1` | AWS CDK | 3.4 (3.3–3.4) | 3.3 (3.2–3.4) |
| `lambda-1` | CDK hotswap | 3.3 (3.3–3.4) | 3.3 (3.2–3.4) |
| `lambda-5` | Stacktape | 3.2 (3.1–3.2) | 6.4 (5.2–6.8) |
| `lambda-5` | Serverless | 9.8 (9.5–9.9) | 9.2 (9.0–9.4) |
| `lambda-5` | SST | 10.7 (10.4–10.9) | 10.1 (10.0–10.3) |
| `lambda-5` | AWS CDK | 6.0 (5.9–6.0) | 5.5 (5.5–5.7) |
| `lambda-5` | CDK hotswap | 5.6 (5.5–5.8) | 5.5 (5.4–5.6) |
| `lambda-25` | Stacktape | 3.8 (3.7–3.8) | 9.1 (8.0–9.3) |
| `lambda-25` | Serverless | 29.7 (29.1–30.1) | 253.4 (130.1–348.0) |
| `lambda-25` | SST | 25.0 (23.6–25.3) | 23.3 (22.5–23.6) |
| `lambda-25` | AWS CDK | 17.3 (16.6–17.8) | 16.9 (16.7–17.3) |
| `lambda-25` | CDK hotswap | 17.8 (17.6–18.2) | 16.9 (16.7–17.3) |

## Lambda upload size: MB, functions, layers and source maps

| App | Tool | 22 Oct | 21 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 7.79 (7.79–7.79) | 7.79 (7.79–7.79) |
| `lambda-1` | Serverless | 19.87 (19.87–19.87) | 19.87 (19.87–19.87) |
| `lambda-1` | SST | 44.07 (44.07–44.07) | 44.07 (44.07–44.07) |
| `lambda-1` | AWS CDK | 10.33 (10.33–10.33) | 10.33 (10.33–10.33) |
| `lambda-1` | CDK hotswap | 10.33 (10.33–10.33) | 10.33 (10.33–10.33) |
| `lambda-5` | Stacktape | 19.52 (19.52–19.52) | 19.52 (19.52–19.52) |
| `lambda-5` | Serverless | 96.08 (96.08–96.08) | 96.08 (96.08–96.08) |
| `lambda-5` | SST | 178.31 (178.31–178.31) | 178.31 (178.31–178.31) |
| `lambda-5` | AWS CDK | 25.31 (25.31–25.31) | 25.31 (25.31–25.31) |
| `lambda-5` | CDK hotswap | 25.31 (25.31–25.31) | 25.31 (25.31–25.31) |
| `lambda-25` | Stacktape | 19.55 (19.55–19.55) | 19.54 (19.54–19.54) |
| `lambda-25` | Serverless | 464.31 (464.31–464.31) | 464.31 (464.31–464.31) |
| `lambda-25` | SST | 817.56 (817.56–817.56) | 817.56 (817.56–817.56) |
| `lambda-25` | AWS CDK | 96.47 (96.47–96.47) | 96.47 (96.47–96.47) |
| `lambda-25` | CDK hotswap | 96.47 (96.47–96.47) | 96.47 (96.47–96.47) |

## Lambda CLI deploy, handler changes: seconds until new code serves

| App | Tool | 22 Oct | 21 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 10.7 (10.4–11.6) | 10.6 (10.1–13.3) |
| `lambda-1` | Serverless | 21.8 (21.0–24.5) | 22.1 (21.6–24.9) |
| `lambda-1` | SST | 15.4 (14.7–18.7) | 15.1 (14.6–18.3) |
| `lambda-1` | AWS CDK | 22.2 (21.9–25.0) | 22.3 (21.3–32.5) |
| `lambda-1` | CDK hotswap | 13.2 (12.8–15.6) | 13.1 (12.6–14.9) |
| `lambda-5` | Stacktape | 12.2 (11.7–12.7) | 15.6 (13.9–16.6) |
| `lambda-5` | Serverless | 26.7 (26.3–27.6) | 27.2 (26.4–28.4) |
| `lambda-5` | SST | 18.3 (17.8–20.1) | 18.2 (17.8–20.8) |
| `lambda-5` | AWS CDK | 26.2 (25.2–30.0) | 25.6 (25.1–27.4) |
| `lambda-5` | CDK hotswap | 16.5 (16.1–18.6) | 16.2 (16.0–20.4) |
| `lambda-25` | Stacktape | 14.5 (12.9–19.7) | 21.2 (20.7–22.7) |
| `lambda-25` | Serverless | 56.7 (53.7–61.8) | 361.9 (196.0–418.7) |
| `lambda-25` | SST | 35.0 (34.2–44.9) | 43.2 (42.7–44.3) |
| `lambda-25` | AWS CDK | 71.8 (46.5–75.7) | 71.0 (49.3–78.0) |
| `lambda-25` | CDK hotswap | 36.9 (33.9–39.5) | 38.0 (36.5–39.7) |

## Lambda CLI deploy, shared-package change: seconds until new code serves

| App | Tool | 22 Oct | 21 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 10.8 (10.6–10.9) | 10.6 (10.4–11.2) |
| `lambda-1` | Serverless | 21.8 (21.3–22.8) | 21.8 (21.6–23.5) |
| `lambda-1` | SST | 15.2 (14.7–15.7) | 15.1 (14.5–15.5) |
| `lambda-1` | AWS CDK | 22.0 (21.6–26.9) | 22.2 (21.3–22.8) |
| `lambda-1` | CDK hotswap | 13.1 (12.7–13.8) | 13.1 (12.3–13.7) |
| `lambda-5` | Stacktape | 17.3 (16.9–18.1) | 30.7 (30.1–32.8) |
| `lambda-5` | Serverless | 27.2 (26.2–31.5) | 26.5 (25.8–27.8) |
| `lambda-5` | SST | 18.4 (17.9–18.9) | 18.1 (17.6–18.5) |
| `lambda-5` | AWS CDK | 25.5 (24.8–25.7) | 26.1 (25.1–35.6) |
| `lambda-5` | CDK hotswap | 16.4 (15.8–17.2) | 16.2 (15.9–16.5) |
| `lambda-25` | Stacktape | 19.3 (18.6–20.7) | 51.4 (49.8–53.3) |
| `lambda-25` | Serverless | 57.3 (53.4–83.2) | 363.0 (214.5–468.0) |
| `lambda-25` | SST | 35.2 (32.5–44.4) | 33.4 (31.3–34.5) |
| `lambda-25` | AWS CDK | 62.8 (47.9–80.8) | 67.9 (45.7–74.7) |
| `lambda-25` | CDK hotswap | 36.2 (35.0–39.9) | 35.7 (33.0–36.6) |

## Container CLI deploy: seconds until new code serves

| App | Tool | 22 Oct | 21 Oct | 17 Oct |
| --- | --- | --- | --- | --- |
| `container-node` | Stacktape | 4.1 (4.0–4.1) | 4.1 (4.0–5.1) | 40.1 (32.1–50.1) |
| `container-node` | SST | 54.5 (42.0–65.1) | — | 138.6 (49.0–168.1) |
| `container-node` | AWS CDK | 63.0 (60.0–92.1) | — | 68.1 (60.0–78.1) |
| `container-node` | CDK hotswap | 44.5 (36.0–56.0) | — | 49.5 (36.0–64.1) |
| `container-node` | Heroku | 26.6 (25.0–28.1) | — | 28.0 (25.0–30.1) |
| `container-python` | Stacktape | 7.6 (7.1–19.1) | 55.1 (37.1–72.1) | 47.6 (39.1–65.1) |
| `container-python` | SST | 48.5 (42.0–77.1) | — | 96.6 (44.0–428.2) [1 failed] |
| `container-python` | AWS CDK | 64.5 (61.0–74.0) | — | 66.1 (61.0–85.1) |
| `container-python` | CDK hotswap | 42.5 (38.0–47.0) | — | 40.5 (36.0–58.1) |
| `container-python` | Heroku | 20.0 (19.0–58.1) | — | 21.6 (19.1–47.1) |
| `five-services` | Stacktape | 6.1 (5.1–6.1) | 64.6 (48.1–81.1) | 57.6 (38.1–63.1) |
| `five-services` | SST | 58.5 (53.0–76.1) | — | 73.0 (54.0–408.2) [1 failed] |
| `five-services` | AWS CDK | 80.1 (70.0–91.1) | — | 77.6 (72.1–86.1) |
| `five-services` | CDK hotswap | 55.0 (47.0–59.0) | — | 54.5 (46.0–58.0) |
| `five-services` | Heroku | 29.0 (26.0–35.0) | — | 30.5 (28.0–64.1) |

## Container image size: MB, compressed

| App | Tool | 22 Oct | 21 Oct | 17 Oct |
| --- | --- | --- | --- | --- |
| `container-node` | Stacktape | 63.39 (63.39–63.39) n=1 | — | 63.35 (63.35–63.35) n=1 |
| `container-node` | SST | 86.63 (86.63–86.63) n=1 | — | 86.60 (86.60–86.60) n=1 |
| `container-node` | AWS CDK | 86.63 (86.63–86.63) n=1 | — | 86.60 (86.60–86.60) n=1 |
| `container-python` | Stacktape | 53.44 (53.44–53.44) n=1 | — | 53.44 (53.44–53.44) n=1 |
| `container-python` | SST | 54.68 (54.68–54.68) n=1 | — | 54.69 (54.69–54.69) n=1 |
| `container-python` | AWS CDK | 54.68 (54.68–54.68) n=1 | — | 54.69 (54.69–54.69) n=1 |

## Render Git push: seconds from `git push` until new code serves

| App | Push | 22 Oct | 17 Oct |
| --- | --- | --- | --- |
| `container-node` | first push, empty build cache | 35.1 (31.1–44.1) | 34.1 (28.1–116.1) n=12 |
| `container-node` | 15 minutes later | 44.1 (36.1–89.1) | 39.6 (31.1–70.1) |
| `container-python` | first push, empty build cache | 61.6 (48.1–96.1) | 54.1 (45.1–74.1) n=11 |
| `container-python` | 15 minutes later | 59.1 (53.1–105.1) | 55.1 (36.1–88.1) n=11 |
| `five-services` | first push, empty build cache | 43.1 (35.0–70.1) | 37.6 (33.1–120.1) [1 failed] |
| `five-services` | 15 minutes later | 43.1 (36.1–67.1) | 38.6 (34.1–85.1) |
