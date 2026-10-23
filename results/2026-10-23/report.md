
**Lambda packaging time and upload size**

| series | runs | failed | seconds: median (min–max) | MB: median (min–max) |
| --- | --- | --- | --- | --- |

**Container image size**

| series | runs | MB: median (min–max) |
| --- | --- | --- |

**Time from deploy start (or git push return) until the new code serves**

| series | runs | valid | excluded | seconds: median (min–max) |
| --- | --- | --- | --- | --- |
| container-node stacktape git-first handlers opt-in | 2 | 0 | 2 | – |
| container-node stacktape git-resume handlers opt-in | 10 | 10 | 0 | 38.7 (36.1–53.3) |
| container-node stacktape git-warm handlers opt-in | 10 | 10 | 0 | 18.2 (17.2–21.9) |
| container-python stacktape git-first handlers opt-in | 2 | 0 | 2 | – |
| container-python stacktape git-resume handlers opt-in | 7 | 5 | 2 | 91.4 (67.6–107.9) |
| container-python stacktape git-warm handlers opt-in | 8 | 8 | 0 | 58.4 (49.5–79.1) |
| five-services stacktape git-first handlers opt-in | 1 | 0 | 1 | – |
| five-services stacktape git-resume handlers opt-in | 8 | 7 | 1 | 111.6 (104.0–121.1) |
| five-services stacktape git-warm handlers opt-in | 9 | 9 | 0 | 80.9 (72.2–95.2) |
| lambda-25 stacktape git-first handlers | 1 | 0 | 1 | – |
| lambda-25 stacktape git-resume handlers | 10 | 10 | 0 | 59.5 (56.3–141.9) |
| lambda-25 stacktape git-warm handlers | 10 | 10 | 0 | 40.2 (39.5–41.3) |
| lambda-5 stacktape git-first handlers | 1 | 0 | 1 | – |
| lambda-5 stacktape git-resume handlers | 10 | 10 | 0 | 58.1 (53.8–64.2) |
| lambda-5 stacktape git-warm handlers | 10 | 10 | 0 | 38.0 (36.0–38.9) |

**Opt-in container deployment paths (subsets of the results above)**

| series | runs | valid | seconds: median (min–max) |
| --- | --- | --- | --- |
| container-node git-first code-swap | 1 | 0 | – |
| container-node git-first image | 1 | 0 | – |
| container-node git-resume code-swap | 10 | 10 | 38.7 (36.1–53.3) |
| container-node git-warm code-swap | 10 | 10 | 18.2 (17.2–21.9) |
| container-python git-first image | 2 | 0 | – |
| container-python git-resume image | 7 | 5 | 91.4 (67.6–107.9) |
| container-python git-warm image | 8 | 8 | 58.4 (49.5–79.1) |
| five-services git-first image | 1 | 0 | – |
| five-services git-resume image | 8 | 7 | 111.6 (104.0–121.1) |
| five-services git-warm image | 9 | 9 | 80.9 (72.2–95.2) |
- Excluded: lambda-25 stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-lambda-25-push-2026-10-23T09-32-08-663Z.log
- Excluded: lambda-5 stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-lambda-5-push-2026-10-23T09-32-08-656Z.log
- Excluded: container-node stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-container-node-push-2026-10-23T09-34-23-295Z.log
- Excluded: container-node stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-container-node-push-2026-10-23T09-45-11-178Z.log
- Excluded: container-python stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-container-python-push-2026-10-23T09-45-11-179Z.log
- Excluded: five-services stacktape git-first handlers run 1 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-five-services-push-2026-10-23T09-45-11-193Z.log
- Excluded: container-python stacktape git-resume handlers run 1 (excluded: the platform was still recording the idle stop: EC2 runner setup failed: Another deployment is still preparing this EC2 runner.); log logs/bmk-stacktape-container-python-push-2026-10-23T09-45-11-179Z.log
- Excluded: container-python stacktape git-resume handlers run 2 (excluded: the platform was still recording the idle stop: EC2 runner setup failed: Another deployment is still preparing this EC2 runner.); log logs/bmk-stacktape-container-python-push-2026-10-23T09-45-11-179Z.log
- Excluded: container-python stacktape git-first handlers run 3 (excluded: first push after setup, which only starts the series); log logs/bmk-stacktape-container-python-push-2026-10-23T11-19-46-808Z.log
- Excluded: five-services stacktape git-resume handlers run 8 (excluded: the platform was still recording the idle stop: EC2 runner setup failed: Another deployment is still preparing this EC2 runner.); log logs/bmk-stacktape-five-services-push-2026-10-23T09-45-11-193Z.log
