# 21 October versus 17 October 2026

Seconds unless labelled MB. Each cell is median (minimum–maximum). The Lambda fixture and Stacktape CLI changed, so this is a comparison of two qualifications, not an isolated regression test. Competitor containers were not rerun.


## Lambda packaging, empty build cache: seconds

| App | Tool | 21 Oct | 17 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 2.3 (2.2–2.3) | 1.7 (1.7–1.7) |
| `lambda-1` | Serverless | 5.7 (5.6–5.9) | 5.2 (5.0–5.5) |
| `lambda-1` | SST | 7.0 (6.9–7.3) | 6.3 (6.2–6.5) |
| `lambda-1` | AWS CDK | 3.3 (3.2–3.4) | 3.0 (2.9–3.3) |
| `lambda-1` | CDK hotswap | 3.3 (3.2–3.4) | — |
| `lambda-5` | Stacktape | 6.4 (5.2–6.5) | 1.9 (1.8–1.9) |
| `lambda-5` | Serverless | 9.2 (9.1–9.4) | 7.0 (6.9–7.2) |
| `lambda-5` | SST | 9.6 (9.4–9.8) | 7.6 (7.5–8.0) |
| `lambda-5` | AWS CDK | 5.6 (5.5–5.7) | 4.4 (4.3–4.5) |
| `lambda-5` | CDK hotswap | 5.5 (5.5–5.6) | — |
| `lambda-25` | Stacktape | 9.1 (8.0–9.3) | 3.2 (3.1–3.2) |
| `lambda-25` | Serverless | 204.7 (161.6–308.4) | 19.5 (19.2–19.8) |
| `lambda-25` | SST | 22.5 (22.2–23.3) | 14.0 (13.7–14.3) |
| `lambda-25` | AWS CDK | 16.6 (16.6–16.7) | 11.4 (11.3–11.5) |
| `lambda-25` | CDK hotswap | 16.6 (16.5–17.0) | — |

## Lambda packaging, source change: seconds

| App | Tool | 21 Oct | 17 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 2.2 (2.2–2.3) | 1.7 (1.7–1.7) |
| `lambda-1` | Serverless | 5.7 (5.6–5.8) | 5.1 (5.0–5.3) |
| `lambda-1` | SST | 7.2 (7.0–7.6) | 6.4 (6.2–6.5) |
| `lambda-1` | AWS CDK | 3.3 (3.2–3.4) | 3.0 (2.9–3.0) |
| `lambda-1` | CDK hotswap | 3.3 (3.2–3.4) | — |
| `lambda-5` | Stacktape | 6.4 (5.2–6.8) | 1.9 (1.8–1.9) |
| `lambda-5` | Serverless | 9.2 (9.0–9.4) | 7.0 (6.9–7.2) |
| `lambda-5` | SST | 10.1 (10.0–10.3) | 7.8 (7.6–8.1) |
| `lambda-5` | AWS CDK | 5.5 (5.5–5.7) | 4.4 (4.3–4.4) |
| `lambda-5` | CDK hotswap | 5.5 (5.4–5.6) | — |
| `lambda-25` | Stacktape | 9.1 (8.0–9.3) | 3.2 (3.1–3.3) |
| `lambda-25` | Serverless | 253.4 (130.1–348.0) | 19.6 (19.3–20.4) |
| `lambda-25` | SST | 23.3 (22.5–23.6) | 14.7 (14.4–15.0) |
| `lambda-25` | AWS CDK | 16.9 (16.7–17.3) | 11.4 (11.3–11.6) |
| `lambda-25` | CDK hotswap | 16.9 (16.7–17.3) | — |

## Lambda upload size: MB, functions, layers and source maps

| App | Tool | 21 Oct | 17 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 7.79 (7.79–7.79) | 6.64 (6.64–6.64) |
| `lambda-1` | Serverless | 19.87 (19.87–19.87) | 16.54 (16.54–16.54) |
| `lambda-1` | SST | 44.07 (44.07–44.07) | 33.67 (33.67–33.67) |
| `lambda-1` | AWS CDK | 10.33 (10.33–10.33) | 9.40 (9.40–9.40) |
| `lambda-1` | CDK hotswap | 10.33 (10.33–10.33) | — |
| `lambda-5` | Stacktape | 19.52 (19.52–19.52) | 6.71 (6.71–6.71) |
| `lambda-5` | Serverless | 96.08 (96.08–96.08) | 74.61 (74.61–74.61) |
| `lambda-5` | SST | 178.31 (178.31–178.31) | 115.81 (115.81–115.81) |
| `lambda-5` | AWS CDK | 25.31 (25.31–25.31) | 19.33 (19.33–19.33) |
| `lambda-5` | CDK hotswap | 25.31 (25.31–25.31) | — |
| `lambda-25` | Stacktape | 19.54 (19.54–19.54) | 6.73 (6.73–6.73) |
| `lambda-25` | Serverless | 464.31 (464.31–464.31) | 361.80 (361.80–361.80) |
| `lambda-25` | SST | 817.56 (817.56–817.56) | 515.47 (515.47–515.47) |
| `lambda-25` | AWS CDK | 96.47 (96.47–96.47) | 68.12 (68.12–68.12) |
| `lambda-25` | CDK hotswap | 96.47 (96.47–96.47) | — |

## Lambda CLI deploy, handler changes: seconds until new code serves

| App | Tool | 21 Oct | 17 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 10.6 (10.1–13.3) | 9.5 (8.8–11.1) |
| `lambda-1` | Serverless | 22.1 (21.6–24.9) | 19.8 (18.5–21.3) |
| `lambda-1` | SST | 15.1 (14.6–18.3) | 13.8 (13.3–20.3) |
| `lambda-1` | AWS CDK | 22.3 (21.3–32.5) | 20.7 (20.3–22.1) |
| `lambda-1` | CDK hotswap | 13.1 (12.6–14.9) | 11.4 (10.9–12.7) |
| `lambda-5` | Stacktape | 15.6 (13.9–16.6) | 9.8 (7.2–10.5) |
| `lambda-5` | Serverless | 27.2 (26.4–28.4) | 23.1 (22.6–24.7) |
| `lambda-5` | SST | 18.2 (17.8–20.8) | 14.9 (14.1–15.2) |
| `lambda-5` | AWS CDK | 25.6 (25.1–27.4) | 22.4 (22.1–23.7) |
| `lambda-5` | CDK hotswap | 16.2 (16.0–20.4) | 13.4 (12.7–14.5) |
| `lambda-25` | Stacktape | 21.2 (20.7–22.7) | 11.9 (10.5–12.3) |
| `lambda-25` | Serverless | 361.9 (196.0–418.7) | 48.0 (45.9–66.3) |
| `lambda-25` | SST | 43.2 (42.7–44.3) | 32.2 (25.4–33.3) |
| `lambda-25` | AWS CDK | 71.0 (49.3–78.0) | 58.7 (38.9–66.9) |
| `lambda-25` | CDK hotswap | 38.0 (36.5–39.7) | 27.1 (26.0–28.4) |

## Lambda CLI deploy, shared-package change: seconds until new code serves

| App | Tool | 21 Oct | 17 Oct |
| --- | --- | --- | --- |
| `lambda-1` | Stacktape | 10.6 (10.4–11.2) | 9.5 (9.1–9.9) |
| `lambda-1` | Serverless | 21.8 (21.6–23.5) | 19.7 (19.2–20.6) |
| `lambda-1` | SST | 15.1 (14.5–15.5) | 13.6 (13.0–16.7) |
| `lambda-1` | AWS CDK | 22.2 (21.3–22.8) | 20.8 (20.2–21.3) |
| `lambda-1` | CDK hotswap | 13.1 (12.3–13.7) | 11.6 (11.4–12.4) |
| `lambda-5` | Stacktape | 30.7 (30.1–32.8) | 29.9 (28.9–31.1) |
| `lambda-5` | Serverless | 26.5 (25.8–27.8) | 23.1 (22.3–108.2) |
| `lambda-5` | SST | 18.1 (17.6–18.5) | 14.8 (14.5–15.8) |
| `lambda-5` | AWS CDK | 26.1 (25.1–35.6) | 22.6 (22.2–23.5) |
| `lambda-5` | CDK hotswap | 16.2 (15.9–16.5) | 13.2 (12.8–13.5) |
| `lambda-25` | Stacktape | 51.4 (49.8–53.3) | 37.7 (34.3–114.4) |
| `lambda-25` | Serverless | 363.0 (214.5–468.0) | 46.7 (43.3–50.6) |
| `lambda-25` | SST | 33.4 (31.3–34.5) | 31.7 (29.3–33.2) |
| `lambda-25` | AWS CDK | 67.9 (45.7–74.7) | 58.4 (38.6–68.6) |
| `lambda-25` | CDK hotswap | 35.7 (33.0–36.6) | 25.8 (24.8–27.9) |

## Container CLI deploy

| App | Tool | 21 Oct opt-in | 17 Oct |
| --- | --- | --- | --- |
| `container-node` | Stacktape | 4.1 (4.0–5.1) | 40.1 (32.1–50.1) |
| `container-python` | Stacktape | 55.1 (37.1–72.1) | 47.6 (39.1–65.1) |
| `five-services` | Stacktape | 64.6 (48.1–81.1) | 57.6 (38.1–63.1) |
