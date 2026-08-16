# Logisticiti Intelligence Portal

A self-updating page of trending freight forwarding / ocean / air cargo news, press releases &amp; advisories, and expert opinion — sourced worldwide from shipping lines, forwarders, airlines, ports and major trade media, deduplicated, each item linked back to the original. Branded with your logo and colors, plus a fixed sidebar promoting the Logisticiti Store and LinkedIn ad slots.

## What's in here
- `index.html` — the portal. White background, your logo in the header, black/red brand palette.
- `assets/logo.svg`, `assets/favicon.png` — your logo files.
- `data.json` — the current set of published items. This is what drives the page.
- `generate-content.js` — calls the Claude API (web search on) to research fresh, deduplicated global news and update `data.json`. It reads what's already published so it doesn't repeat stories.
- `.github/workflows/daily-update.yml` — runs that script automatically, roughly every 10 hours (UAE time), and commits the new `data.json`.

## Updating your existing repo (logisticiti-ux/logisticiti-portal)
Since your repo already exists with the old version of these files:
1. On your computer, unzip the new files I've given you.
2. In your GitHub repo, click into each file you already uploaded (`index.html`, `data.json`, `generate-content.js`, the workflow file) → click the pencil/**Edit** icon → select all the existing content and delete it → paste in the new file's content → **Commit changes**.
   - Simpler alternative: delete the old files from the repo (open the file → the "..." menu → Delete file) and re-upload everything fresh via **Add file → Upload files**, including the new `assets` folder with your logo and favicon.
3. Wait 1–2 minutes for GitHub Pages to rebuild, then refresh your live URL: `https://logisticiti-ux.github.io/logisticiti-portal/`

## Turning on the automatic refresh (if you haven't already)
1. Get an API key from [console.anthropic.com](https://console.anthropic.com) (this is the developer/API side, separate from your claude.ai login) — add a little billing credit, since usage is pay-as-you-go.
2. In your repo: **Settings → Secrets and variables → Actions → New repository secret**. Name it exactly `ANTHROPIC_API_KEY`, paste your key as the value.
3. That's it — the workflow refreshes the portal automatically ~every 10 hours (04:00, 14:00, and 00:00 Gulf Standard Time). To test it right now instead of waiting: **Actions tab → "Logisticiti briefing update" → Run workflow**.

## The sidebar columns
- **Logisticiti Store** — pulls from your Gumroad page (`logisticiti.gumroad.com`). It's static in `index.html` right now (product names/prices are hardcoded), so update them there whenever your product line-up changes — look for the `promo-card` section.
- **Advertise With Us** — a fixed ad slot inviting brands to promote through your LinkedIn platform, linking to your LinkedIn page. Edit the copy in the `ad-card` section of `index.html` if you want to change the pitch or link it to a contact form/email instead.

## Sourcing rules baked into the generator
The prompt in `generate-content.js` tells Claude to:
- Search globally — Middle East/Gulf, Asia-Pacific, Europe, Americas, Africa — not just one region.
- Pull specifically from shipping lines, major forwarders, airlines/air cargo carriers, port operators, and major trade media (The Loadstar, FreightWaves, Journal of Commerce, Air Cargo News, Lloyd's List, Reuters, Bloomberg).
- Check the list of already-published stories and avoid repeating the same event or company more than twice per run.
- Never quote source text directly — everything is paraphrased, and every item links back to its original source.

## Editing the design
- Colors, type, and layout live in the `<style>` block at the top of `index.html` — brand red is `--red: #E4212B`, brand black is `--black: #111111`.
- To swap the logo, just replace `assets/logo.svg` with a new file of the same name.

## Costs
- GitHub Pages + Actions: free for public repos.
- Anthropic API: pay-per-use. A research call like this, run 3x a day, is typically a small fraction of a dollar per day — check current pricing at [anthropic.com/pricing](https://www.anthropic.com/pricing).
