# Memory during the 22 October 2026 runs

Every packaging and deploy run sampled the whole machine every 250 ms from the start of the measured command until it
exited (`sampleMemory` in [`lib.mjs`](../../lib.mjs)). The machine has 15.3 GiB of memory and an 8 GiB swap file.
Samples cover every process on the machine, including the Render lanes (which only push and poll) and, during the
container phase, the other two container lanes. Pages are 4 KiB.

No run came close to running out of memory. The highest peak was 11.9 GB, during Render warm pushes that overlapped
Serverless `lambda-25` deploys. Serverless `lambda-25` peaked at 11.5 GB with `buildConcurrency: 8`; the most it paged
out in one run was about 68 MB (17,410 pages), with almost nothing paged back in, so the machine did not thrash as it did
on 21 October. The largest page-in, about 41 MB, happened once at 00:51 UTC across three concurrent container runs as
idle memory was touched again. The "peak swap" column is the swap file's occupancy, which includes pages swapped out
during setup and never reclaimed; the last column counts runs that paged anything out at all.

| Series | runs with data | peak used GB: median (max) | peak swap MB: max | runs that swapped out pages |
| --- | --- | --- | --- | --- |
| container-node cdk cli handlers | 10 | 3.3 (3.4) | 440 | 0 |
| container-node cdk-hotswap cli handlers | 10 | 3.0 (3.5) | 438 | 0 |
| container-node heroku cli handlers | 10 | 2.6 (3.0) | 408 | 0 |
| container-node render git-cold handlers | 10 | 3.2 (11.3) | 322 | 3 |
| container-node render git-warm handlers | 10 | 4.9 (11.1) | 344 | 2 |
| container-node sst cli handlers | 10 | 3.0 (4.3) | 441 | 1 |
| container-node stacktape cli handlers | 10 | 2.7 (3.2) | 408 | 0 |
| container-python cdk cli handlers | 10 | 3.3 (3.4) | 440 | 0 |
| container-python cdk-hotswap cli handlers | 10 | 2.9 (3.5) | 438 | 0 |
| container-python heroku cli handlers | 10 | 2.4 (3.0) | 438 | 0 |
| container-python render git-cold handlers | 10 | 6.5 (11.2) | 328 | 4 |
| container-python render git-warm handlers | 10 | 3.5 (11.9) | 385 | 6 |
| container-python sst cli handlers | 10 | 3.1 (4.3) | 441 | 1 |
| container-python stacktape cli handlers | 10 | 2.4 (3.2) | 438 | 0 |
| five-services cdk cli handlers | 10 | 3.0 (3.3) | 438 | 0 |
| five-services cdk-hotswap cli handlers | 10 | 2.9 (3.9) | 438 | 1 |
| five-services heroku cli handlers | 10 | 2.5 (2.7) | 408 | 0 |
| five-services render git-cold handlers | 10 | 5.1 (10.8) | 322 | 2 |
| five-services render git-warm handlers | 10 | 4.9 (11.9) | 328 | 3 |
| five-services sst cli handlers | 10 | 3.4 (4.3) | 441 | 0 |
| five-services stacktape cli handlers | 10 | 2.7 (3.1) | 408 | 0 |
| lambda-1 cdk cli handlers | 10 | 2.6 (2.7) | 143 | 1 |
| lambda-1 cdk cli shared | 10 | 2.5 (2.6) | 143 | 0 |
| lambda-1 cdk package clean | 10 | 2.7 (2.8) | 0 | 0 |
| lambda-1 cdk package warm | 10 | 2.7 (2.8) | 0 | 0 |
| lambda-1 cdk-hotswap cli handlers | 10 | 2.6 (2.7) | 143 | 0 |
| lambda-1 cdk-hotswap cli shared | 10 | 2.6 (2.6) | 143 | 0 |
| lambda-1 cdk-hotswap package clean | 10 | 2.7 (2.8) | 0 | 0 |
| lambda-1 cdk-hotswap package warm | 10 | 2.8 (2.9) | 0 | 0 |
| lambda-1 serverless cli handlers | 10 | 3.3 (3.3) | 143 | 1 |
| lambda-1 serverless cli shared | 10 | 3.3 (3.4) | 143 | 2 |
| lambda-1 serverless package clean | 10 | 3.1 (3.2) | 0 | 0 |
| lambda-1 serverless package warm | 10 | 3.1 (3.1) | 0 | 0 |
| lambda-1 sst cli handlers | 10 | 3.5 (3.6) | 143 | 4 |
| lambda-1 sst cli shared | 10 | 3.5 (3.7) | 143 | 6 |
| lambda-1 sst package clean | 10 | 3.4 (3.5) | 0 | 0 |
| lambda-1 sst package warm | 10 | 3.5 (3.5) | 0 | 0 |
| lambda-1 stacktape cli handlers | 10 | 2.6 (2.7) | 143 | 0 |
| lambda-1 stacktape cli shared | 10 | 2.6 (2.8) | 143 | 0 |
| lambda-1 stacktape package clean | 10 | 2.5 (2.6) | 0 | 0 |
| lambda-1 stacktape package warm | 10 | 2.5 (2.6) | 0 | 0 |
| lambda-25 cdk cli handlers | 10 | 2.5 (2.8) | 441 | 0 |
| lambda-25 cdk cli shared | 10 | 2.6 (2.8) | 441 | 0 |
| lambda-25 cdk package clean | 10 | 2.8 (2.9) | 124 | 0 |
| lambda-25 cdk package warm | 10 | 2.8 (2.9) | 124 | 2 |
| lambda-25 cdk-hotswap cli handlers | 10 | 2.6 (2.7) | 441 | 0 |
| lambda-25 cdk-hotswap cli shared | 10 | 2.6 (2.8) | 441 | 1 |
| lambda-25 cdk-hotswap package clean | 10 | 2.9 (2.9) | 123 | 2 |
| lambda-25 cdk-hotswap package warm | 10 | 2.8 (2.9) | 125 | 4 |
| lambda-25 serverless cli handlers | 10 | 10.9 (11.4) | 441 | 8 |
| lambda-25 serverless cli shared | 10 | 11.1 (11.5) | 441 | 6 |
| lambda-25 serverless package clean | 10 | 10.6 (11.2) | 169 | 0 |
| lambda-25 serverless package warm | 10 | 10.8 (11.5) | 130 | 0 |
| lambda-25 sst cli handlers | 10 | 7.5 (8.1) | 441 | 2 |
| lambda-25 sst cli shared | 10 | 7.6 (8.2) | 441 | 3 |
| lambda-25 sst package clean | 10 | 7.9 (8.6) | 101 | 0 |
| lambda-25 sst package warm | 10 | 7.8 (8.3) | 129 | 7 |
| lambda-25 stacktape cli handlers | 10 | 2.5 (2.8) | 430 | 0 |
| lambda-25 stacktape cli shared | 10 | 2.5 (2.9) | 430 | 0 |
| lambda-25 stacktape package clean | 10 | 3.2 (3.4) | 0 | 0 |
| lambda-25 stacktape package warm | 10 | 3.3 (3.5) | 0 | 0 |
| lambda-5 cdk cli handlers | 10 | 2.7 (2.8) | 188 | 0 |
| lambda-5 cdk cli shared | 10 | 2.6 (2.9) | 188 | 0 |
| lambda-5 cdk package clean | 10 | 3.1 (3.2) | 0 | 0 |
| lambda-5 cdk package warm | 10 | 3.1 (3.3) | 0 | 0 |
| lambda-5 cdk-hotswap cli handlers | 10 | 2.7 (2.9) | 188 | 0 |
| lambda-5 cdk-hotswap cli shared | 10 | 2.6 (2.8) | 188 | 0 |
| lambda-5 cdk-hotswap package clean | 10 | 3.3 (3.3) | 0 | 0 |
| lambda-5 cdk-hotswap package warm | 10 | 3.2 (3.3) | 0 | 0 |
| lambda-5 serverless cli handlers | 10 | 6.2 (6.5) | 188 | 2 |
| lambda-5 serverless cli shared | 10 | 6.3 (6.6) | 188 | 4 |
| lambda-5 serverless package clean | 10 | 6.6 (6.9) | 0 | 0 |
| lambda-5 serverless package warm | 10 | 6.6 (6.9) | 0 | 0 |
| lambda-5 sst cli handlers | 10 | 6.7 (6.8) | 188 | 8 |
| lambda-5 sst cli shared | 10 | 6.7 (6.8) | 188 | 7 |
| lambda-5 sst package clean | 10 | 7.1 (7.3) | 0 | 0 |
| lambda-5 sst package warm | 10 | 7.1 (7.3) | 0 | 0 |
| lambda-5 stacktape cli handlers | 10 | 2.7 (2.8) | 188 | 0 |
| lambda-5 stacktape cli shared | 10 | 2.7 (3.0) | 188 | 0 |
| lambda-5 stacktape package clean | 10 | 2.9 (2.9) | 0 | 0 |
| lambda-5 stacktape package warm | 10 | 2.9 (3.0) | 0 | 0 |
