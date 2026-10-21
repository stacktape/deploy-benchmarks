
**Lambda packaging time and upload size**

| series | runs | failed | seconds: median (min–max) | MB: median (min–max) |
| --- | --- | --- | --- | --- |
| lambda-1 cdk clean | 10 | 0 | 3.3 (3.2–3.4) | 10.33 (10.33–10.33) |
| lambda-1 cdk warm | 10 | 0 | 3.3 (3.2–3.4) | 10.33 (10.33–10.33) |
| lambda-1 cdk-hotswap clean | 10 | 0 | 3.3 (3.2–3.4) | 10.33 (10.33–10.33) |
| lambda-1 cdk-hotswap warm | 10 | 0 | 3.3 (3.2–3.4) | 10.33 (10.33–10.33) |
| lambda-1 serverless clean | 10 | 0 | 5.7 (5.6–5.9) | 19.87 (19.87–19.87) |
| lambda-1 serverless warm | 10 | 0 | 5.7 (5.6–5.8) | 19.87 (19.87–19.87) |
| lambda-1 sst clean | 10 | 0 | 7.0 (6.9–7.3) | 44.07 (44.07–44.07) |
| lambda-1 sst warm | 10 | 0 | 7.2 (7.0–7.6) | 44.07 (44.07–44.07) |
| lambda-1 stacktape clean | 10 | 0 | 2.3 (2.2–2.3) | 7.79 (7.79–7.79) |
| lambda-1 stacktape warm | 10 | 0 | 2.2 (2.2–2.3) | 7.79 (7.79–7.79) |
| lambda-25 cdk clean | 10 | 0 | 16.6 (16.6–16.7) | 96.47 (96.47–96.47) |
| lambda-25 cdk warm | 10 | 0 | 16.9 (16.7–17.3) | 96.47 (96.47–96.47) |
| lambda-25 cdk-hotswap clean | 10 | 0 | 16.6 (16.5–17.0) | 96.47 (96.47–96.47) |
| lambda-25 cdk-hotswap warm | 10 | 0 | 16.9 (16.7–17.3) | 96.47 (96.47–96.47) |
| lambda-25 serverless clean | 10 | 0 | 204.7 (161.6–308.4) | 464.31 (464.31–464.31) |
| lambda-25 serverless warm | 10 | 0 | 253.4 (130.1–348.0) | 464.31 (464.31–464.31) |
| lambda-25 sst clean | 10 | 0 | 22.5 (22.2–23.3) | 817.56 (817.56–817.56) |
| lambda-25 sst warm | 10 | 0 | 23.3 (22.5–23.6) | 817.56 (817.56–817.56) |
| lambda-25 stacktape clean | 10 | 0 | 9.1 (8.0–9.3) | 19.54 (19.54–19.54) |
| lambda-25 stacktape warm | 10 | 0 | 9.1 (8.0–9.3) | 19.54 (19.54–19.54) |
| lambda-5 cdk clean | 10 | 0 | 5.6 (5.5–5.7) | 25.31 (25.31–25.31) |
| lambda-5 cdk warm | 10 | 0 | 5.5 (5.5–5.7) | 25.31 (25.31–25.31) |
| lambda-5 cdk-hotswap clean | 10 | 0 | 5.5 (5.5–5.6) | 25.31 (25.31–25.31) |
| lambda-5 cdk-hotswap warm | 10 | 0 | 5.5 (5.4–5.6) | 25.31 (25.31–25.31) |
| lambda-5 serverless clean | 10 | 0 | 9.2 (9.1–9.4) | 96.08 (96.08–96.08) |
| lambda-5 serverless warm | 10 | 0 | 9.2 (9.0–9.4) | 96.08 (96.08–96.08) |
| lambda-5 sst clean | 10 | 0 | 9.6 (9.4–9.8) | 178.31 (178.31–178.31) |
| lambda-5 sst warm | 10 | 0 | 10.1 (10.0–10.3) | 178.31 (178.31–178.31) |
| lambda-5 stacktape clean | 10 | 0 | 6.4 (5.2–6.5) | 19.52 (19.52–19.52) |
| lambda-5 stacktape warm | 10 | 0 | 6.4 (5.2–6.8) | 19.52 (19.52–19.52) |

**Container image size**

| series | runs | MB: median (min–max) |
| --- | --- | --- |

**Time from deploy start (or git push return) until the new code serves**

| series | runs | valid | excluded | seconds: median (min–max) |
| --- | --- | --- | --- | --- |
| container-node stacktape cli handlers opt-in | 10 | 10 | 0 | 4.1 (4.0–5.1) |
| container-python stacktape cli handlers opt-in | 10 | 10 | 0 | 55.1 (37.1–72.1) |
| five-services stacktape cli handlers opt-in | 10 | 10 | 0 | 64.6 (48.1–81.1) |
| lambda-1 cdk cli handlers | 10 | 10 | 0 | 22.3 (21.3–32.5) |
| lambda-1 cdk cli shared | 10 | 10 | 0 | 22.2 (21.3–22.8) |
| lambda-1 cdk-hotswap cli handlers | 10 | 10 | 0 | 13.1 (12.6–14.9) |
| lambda-1 cdk-hotswap cli shared | 10 | 10 | 0 | 13.1 (12.3–13.7) |
| lambda-1 serverless cli handlers | 10 | 10 | 0 | 22.1 (21.6–24.9) |
| lambda-1 serverless cli shared | 10 | 10 | 0 | 21.8 (21.6–23.5) |
| lambda-1 sst cli handlers | 10 | 10 | 0 | 15.1 (14.6–18.3) |
| lambda-1 sst cli shared | 10 | 10 | 0 | 15.1 (14.5–15.5) |
| lambda-1 stacktape cli handlers | 10 | 10 | 0 | 10.6 (10.1–13.3) |
| lambda-1 stacktape cli shared | 10 | 10 | 0 | 10.6 (10.4–11.2) |
| lambda-25 cdk cli handlers | 10 | 10 | 0 | 71.0 (49.3–78.0) |
| lambda-25 cdk cli shared | 10 | 10 | 0 | 67.9 (45.7–74.7) |
| lambda-25 cdk-hotswap cli handlers | 10 | 10 | 0 | 38.0 (36.5–39.7) |
| lambda-25 cdk-hotswap cli shared | 10 | 10 | 0 | 35.7 (33.0–36.6) |
| lambda-25 serverless cli handlers | 10 | 10 | 0 | 361.9 (196.0–418.7) |
| lambda-25 serverless cli shared | 10 | 10 | 0 | 363.0 (214.5–468.0) |
| lambda-25 sst cli handlers | 10 | 10 | 0 | 43.2 (42.7–44.3) |
| lambda-25 sst cli shared | 10 | 10 | 0 | 33.4 (31.3–34.5) |
| lambda-25 stacktape cli handlers | 10 | 10 | 0 | 21.2 (20.7–22.7) |
| lambda-25 stacktape cli shared | 10 | 10 | 0 | 51.4 (49.8–53.3) |
| lambda-5 cdk cli handlers | 10 | 10 | 0 | 25.6 (25.1–27.4) |
| lambda-5 cdk cli shared | 10 | 10 | 0 | 26.1 (25.1–35.6) |
| lambda-5 cdk-hotswap cli handlers | 10 | 10 | 0 | 16.2 (16.0–20.4) |
| lambda-5 cdk-hotswap cli shared | 10 | 10 | 0 | 16.2 (15.9–16.5) |
| lambda-5 serverless cli handlers | 10 | 10 | 0 | 27.2 (26.4–28.4) |
| lambda-5 serverless cli shared | 10 | 10 | 0 | 26.5 (25.8–27.8) |
| lambda-5 sst cli handlers | 10 | 10 | 0 | 18.2 (17.8–20.8) |
| lambda-5 sst cli shared | 10 | 10 | 0 | 18.1 (17.6–18.5) |
| lambda-5 stacktape cli handlers | 10 | 10 | 0 | 15.6 (13.9–16.6) |
| lambda-5 stacktape cli shared | 10 | 10 | 0 | 30.7 (30.1–32.8) |

**Opt-in container deployment paths (subsets of the CLI result above)**

| series | runs | valid | seconds: median (min–max) |
| --- | --- | --- | --- |
| container-node code-swap | 10 | 10 | 4.1 (4.0–5.1) |
| container-python image | 10 | 10 | 55.1 (37.1–72.1) |
| five-services image | 10 | 10 | 64.6 (48.1–81.1) |

**Stacktape Git push after verified hibernation (separate samples)**

| series | runs | seconds: median (min–max) |
| --- | --- | --- |
| container-node stacktape git-resume | 3 | 85.1 (69.2–93.1) |
| lambda-25 stacktape git-resume | 3 | 53.9 (51.2–54.9) |
| lambda-5 stacktape git-resume | 3 | 50.3 (48.4–51.7) |
