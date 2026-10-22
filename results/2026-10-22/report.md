
**Lambda packaging time and upload size**

| series | runs | failed | seconds: median (min–max) | MB: median (min–max) |
| --- | --- | --- | --- | --- |
| lambda-1 cdk clean | 10 | 0 | 3.4 (3.3–3.4) | 10.33 (10.33–10.33) |
| lambda-1 cdk warm | 10 | 0 | 3.4 (3.3–3.4) | 10.33 (10.33–10.33) |
| lambda-1 cdk-hotswap clean | 10 | 0 | 3.3 (3.2–3.5) | 10.33 (10.33–10.33) |
| lambda-1 cdk-hotswap warm | 10 | 0 | 3.3 (3.3–3.4) | 10.33 (10.33–10.33) |
| lambda-1 serverless clean | 10 | 0 | 5.8 (5.7–5.8) | 19.87 (19.87–19.87) |
| lambda-1 serverless warm | 10 | 0 | 5.8 (5.6–6.0) | 19.87 (19.87–19.87) |
| lambda-1 sst clean | 10 | 0 | 7.2 (6.9–7.5) | 44.07 (44.07–44.07) |
| lambda-1 sst warm | 10 | 0 | 7.2 (7.1–7.4) | 44.07 (44.07–44.07) |
| lambda-1 stacktape clean | 10 | 0 | 2.3 (2.3–2.4) | 7.79 (7.79–7.79) |
| lambda-1 stacktape warm | 10 | 0 | 2.3 (2.3–2.3) | 7.79 (7.79–7.79) |
| lambda-25 cdk clean | 10 | 0 | 17.6 (17.4–17.6) | 96.47 (96.47–96.47) |
| lambda-25 cdk warm | 10 | 0 | 17.3 (16.6–17.8) | 96.47 (96.47–96.47) |
| lambda-25 cdk-hotswap clean | 10 | 0 | 17.7 (17.3–17.9) | 96.47 (96.47–96.47) |
| lambda-25 cdk-hotswap warm | 10 | 0 | 17.8 (17.6–18.2) | 96.47 (96.47–96.47) |
| lambda-25 serverless clean | 10 | 0 | 28.4 (28.0–29.2) | 464.31 (464.31–464.31) |
| lambda-25 serverless warm | 10 | 0 | 29.7 (29.1–30.1) | 464.31 (464.31–464.31) |
| lambda-25 sst clean | 10 | 0 | 23.9 (23.7–24.2) | 817.56 (817.56–817.56) |
| lambda-25 sst warm | 10 | 0 | 25.0 (23.6–25.3) | 817.56 (817.56–817.56) |
| lambda-25 stacktape clean | 10 | 0 | 3.8 (3.7–3.8) | 19.55 (19.55–19.55) |
| lambda-25 stacktape warm | 10 | 0 | 3.8 (3.7–3.8) | 19.55 (19.55–19.55) |
| lambda-5 cdk clean | 10 | 0 | 6.0 (5.9–6.3) | 25.31 (25.31–25.31) |
| lambda-5 cdk warm | 10 | 0 | 6.0 (5.9–6.0) | 25.31 (25.31–25.31) |
| lambda-5 cdk-hotswap clean | 10 | 0 | 5.7 (5.5–5.9) | 25.31 (25.31–25.31) |
| lambda-5 cdk-hotswap warm | 10 | 0 | 5.6 (5.5–5.8) | 25.31 (25.31–25.31) |
| lambda-5 serverless clean | 10 | 0 | 9.7 (9.5–9.9) | 96.08 (96.08–96.08) |
| lambda-5 serverless warm | 10 | 0 | 9.8 (9.5–9.9) | 96.08 (96.08–96.08) |
| lambda-5 sst clean | 10 | 0 | 10.2 (10.0–10.6) | 178.31 (178.31–178.31) |
| lambda-5 sst warm | 10 | 0 | 10.7 (10.4–10.9) | 178.31 (178.31–178.31) |
| lambda-5 stacktape clean | 10 | 0 | 3.1 (3.1–3.2) | 19.52 (19.52–19.52) |
| lambda-5 stacktape warm | 10 | 0 | 3.2 (3.1–3.2) | 19.52 (19.52–19.52) |

**Container image size**

| series | runs | MB: median (min–max) |
| --- | --- | --- |
| container-node cdk | 1 | 86.63 (86.63–86.63) |
| container-node sst | 1 | 86.63 (86.63–86.63) |
| container-node stacktape | 1 | 63.39 (63.39–63.39) |
| container-python cdk | 1 | 54.68 (54.68–54.68) |
| container-python sst | 1 | 54.68 (54.68–54.68) |
| container-python stacktape | 1 | 53.44 (53.44–53.44) |

**Time from deploy start (or git push return) until the new code serves**

| series | runs | valid | excluded | seconds: median (min–max) |
| --- | --- | --- | --- | --- |
| container-node cdk cli handlers | 10 | 10 | 0 | 63.0 (60.0–92.1) |
| container-node cdk-hotswap cli handlers | 10 | 10 | 0 | 44.5 (36.0–56.0) |
| container-node heroku cli handlers | 10 | 10 | 0 | 26.6 (25.0–28.1) |
| container-node render git-cold handlers | 10 | 10 | 0 | 35.1 (31.1–44.1) |
| container-node render git-warm handlers | 10 | 10 | 0 | 44.1 (36.1–89.1) |
| container-node sst cli handlers | 10 | 10 | 0 | 54.5 (42.0–65.1) |
| container-node stacktape cli handlers opt-in | 10 | 10 | 0 | 4.1 (4.0–4.1) |
| container-python cdk cli handlers | 10 | 10 | 0 | 64.5 (61.0–74.0) |
| container-python cdk-hotswap cli handlers | 10 | 10 | 0 | 42.5 (38.0–47.0) |
| container-python heroku cli handlers | 10 | 10 | 0 | 20.0 (19.0–58.1) |
| container-python render git-cold handlers | 10 | 10 | 0 | 61.6 (48.1–96.1) |
| container-python render git-warm handlers | 10 | 10 | 0 | 59.1 (53.1–105.1) |
| container-python sst cli handlers | 10 | 10 | 0 | 48.5 (42.0–77.1) |
| container-python stacktape cli handlers opt-in | 10 | 10 | 0 | 7.6 (7.1–19.1) |
| five-services cdk cli handlers | 10 | 10 | 0 | 80.1 (70.0–91.1) |
| five-services cdk-hotswap cli handlers | 10 | 10 | 0 | 55.0 (47.0–59.0) |
| five-services heroku cli handlers | 10 | 10 | 0 | 29.0 (26.0–35.0) |
| five-services render git-cold handlers | 10 | 10 | 0 | 43.1 (35.0–70.1) |
| five-services render git-warm handlers | 10 | 10 | 0 | 43.1 (36.1–67.1) |
| five-services sst cli handlers | 10 | 10 | 0 | 58.5 (53.0–76.1) |
| five-services stacktape cli handlers opt-in | 10 | 10 | 0 | 6.1 (5.1–6.1) |
| lambda-1 cdk cli handlers | 10 | 10 | 0 | 22.2 (21.9–25.0) |
| lambda-1 cdk cli shared | 10 | 10 | 0 | 22.0 (21.6–26.9) |
| lambda-1 cdk-hotswap cli handlers | 10 | 10 | 0 | 13.2 (12.8–15.6) |
| lambda-1 cdk-hotswap cli shared | 10 | 10 | 0 | 13.1 (12.7–13.8) |
| lambda-1 serverless cli handlers | 10 | 10 | 0 | 21.8 (21.0–24.5) |
| lambda-1 serverless cli shared | 10 | 10 | 0 | 21.8 (21.3–22.8) |
| lambda-1 sst cli handlers | 10 | 10 | 0 | 15.4 (14.7–18.7) |
| lambda-1 sst cli shared | 10 | 10 | 0 | 15.2 (14.7–15.7) |
| lambda-1 stacktape cli handlers | 10 | 10 | 0 | 10.7 (10.4–11.6) |
| lambda-1 stacktape cli shared | 10 | 10 | 0 | 10.8 (10.6–10.9) |
| lambda-25 cdk cli handlers | 10 | 10 | 0 | 71.8 (46.5–75.7) |
| lambda-25 cdk cli shared | 10 | 10 | 0 | 62.8 (47.9–80.8) |
| lambda-25 cdk-hotswap cli handlers | 10 | 10 | 0 | 36.9 (33.9–39.5) |
| lambda-25 cdk-hotswap cli shared | 10 | 10 | 0 | 36.2 (35.0–39.9) |
| lambda-25 serverless cli handlers | 10 | 10 | 0 | 56.7 (53.7–61.8) |
| lambda-25 serverless cli shared | 10 | 10 | 0 | 57.3 (53.4–83.2) |
| lambda-25 sst cli handlers | 10 | 10 | 0 | 35.0 (34.2–44.9) |
| lambda-25 sst cli shared | 10 | 10 | 0 | 35.2 (32.5–44.4) |
| lambda-25 stacktape cli handlers | 10 | 10 | 0 | 14.5 (12.9–19.7) |
| lambda-25 stacktape cli shared | 10 | 10 | 0 | 19.3 (18.6–20.7) |
| lambda-5 cdk cli handlers | 10 | 10 | 0 | 26.2 (25.2–30.0) |
| lambda-5 cdk cli shared | 10 | 10 | 0 | 25.5 (24.8–25.7) |
| lambda-5 cdk-hotswap cli handlers | 10 | 10 | 0 | 16.5 (16.1–18.6) |
| lambda-5 cdk-hotswap cli shared | 10 | 10 | 0 | 16.4 (15.8–17.2) |
| lambda-5 serverless cli handlers | 10 | 10 | 0 | 26.7 (26.3–27.6) |
| lambda-5 serverless cli shared | 10 | 10 | 0 | 27.2 (26.2–31.5) |
| lambda-5 sst cli handlers | 10 | 10 | 0 | 18.3 (17.8–20.1) |
| lambda-5 sst cli shared | 10 | 10 | 0 | 18.4 (17.9–18.9) |
| lambda-5 stacktape cli handlers | 10 | 10 | 0 | 12.2 (11.7–12.7) |
| lambda-5 stacktape cli shared | 10 | 10 | 0 | 17.3 (16.9–18.1) |

**Opt-in container deployment paths (subsets of the CLI result above)**

| series | runs | valid | seconds: median (min–max) |
| --- | --- | --- | --- |
| container-node code-swap | 10 | 10 | 4.1 (4.0–4.1) |
| container-python code-swap | 10 | 10 | 7.6 (7.1–19.1) |
| five-services code-swap | 10 | 10 | 6.1 (5.1–6.1) |

**Stacktape Git push after verified hibernation (separate samples)**

| series | runs | seconds: median (min–max) |
| --- | --- | --- |
| container-node stacktape git-resume | 3 | 85.1 (69.2–93.1) |
| lambda-25 stacktape git-resume | 3 | 53.9 (51.2–54.9) |
| lambda-5 stacktape git-resume | 3 | 50.3 (48.4–51.7) |
