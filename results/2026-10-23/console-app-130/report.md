
**Lambda packaging time and upload size**

| series | runs | failed | seconds: median (min–max) | MB: median (min–max) |
| --- | --- | --- | --- | --- |

**Container image size**

| series | runs | MB: median (min–max) |
| --- | --- | --- |

**Time from deploy start (or git push return) until the new code serves**

| series | runs | valid | excluded | seconds: median (min–max) |
| --- | --- | --- | --- | --- |
| container-node stacktape git-first handlers opt-in | 1 | 0 | 1 | – |
| container-node stacktape git-resume handlers opt-in | 5 | 5 | 0 | 35.1 (32.2–40.7) |
| container-node stacktape git-warm handlers opt-in | 5 | 5 | 0 | 17.1 (14.3–18.8) |
| container-python stacktape git-first handlers opt-in | 1 | 0 | 1 | – |
| container-python stacktape git-resume handlers opt-in | 6 | 6 | 0 | 43.0 (40.7–46.1) |
| container-python stacktape git-warm handlers opt-in | 6 | 6 | 0 | 23.9 (22.8–26.8) |
| five-services stacktape git-first handlers opt-in | 1 | 0 | 1 | – |
| five-services stacktape git-resume handlers opt-in | 6 | 6 | 0 | 47.1 (45.5–49.7) |
| five-services stacktape git-warm handlers opt-in | 6 | 6 | 0 | 17.2 (16.1–19.0) |

**Opt-in container deployment paths (subsets of the results above)**

| series | runs | valid | seconds: median (min–max) |
| --- | --- | --- | --- |
| container-node git-first code-swap | 1 | 0 | – |
| container-node git-resume code-swap | 5 | 5 | 35.1 (32.2–40.7) |
| container-node git-warm code-swap | 5 | 5 | 17.1 (14.3–18.8) |
| container-python git-first image | 1 | 0 | – |
| container-python git-resume code-swap | 6 | 6 | 43.0 (40.7–46.1) |
| container-python git-warm code-swap | 6 | 6 | 23.9 (22.8–26.8) |
| five-services git-first image | 1 | 0 | – |
| five-services git-resume code-swap | 6 | 6 | 47.1 (45.5–49.7) |
| five-services git-warm code-swap | 6 | 6 | 17.2 (16.1–19.0) |
- Excluded: container-node stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-container-node-push-2026-10-23T15-40-26-235Z.log
- Excluded: container-python stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-container-python-push-2026-10-23T15-40-26-241Z.log
- Excluded: five-services stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-five-services-push-2026-10-23T15-40-26-241Z.log
