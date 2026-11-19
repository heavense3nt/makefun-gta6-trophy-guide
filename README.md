# makefun-gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/heavense3nt/makefun-gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/heavense3nt/makefun-gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden on PlayStation until earned. Every trophy shows its official name, description and grade as PlayStation publishes them, plus a guide written in the author's own words that names its sources (PowerPyx, GTABase, GTA Zone, PSNProfiles, Exophase). The roadmap to the platinum runs story first (60–80 hours), then the 100% checklist (about 100 hours), then stranger strands and clean-up (about 10 hours) — about 200 hours in total at 4/10 difficulty. The one possibly missable trophy, Positive Mental Attitude, is flagged in the app and in the roadmap: meditate at the Chapter 1 home spot before that chapter ends.

The tracker is a checklist whose progress is saved in the browser (localStorage) and can be exported to a file and imported back. Filters cover kind (story, missable, collectibles, activities, online — the list has no online trophies, so that filter shows an honest empty state) and grade, plus a text search. A spoiler setting hides the names and descriptions of hidden story trophies until they are earned.

## Run it

```sh
python3 -m http.server --directory app 8080
```

Then open http://localhost:8080 — no build step, and the app loads nothing over the network, so it works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=s5yp534n&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
