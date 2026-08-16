/**
 * generate-content.js
 * Calls the Claude API (with the web_search tool) to research the latest
 * freight forwarding / ocean / air cargo news worldwide, dedupes it against
 * what's already on the portal, and writes a fresh data.json for the
 * portal (index.html) to render.
 *
 * Requires: ANTHROPIC_API_KEY environment variable.
 * Run: node generate-content.js
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY environment variable.');
  process.exit(1);
}

const DATA_PATH = path.join(__dirname, 'data.json');

// Load what's already published, so the model can avoid repeating stories.
let existing = { items: [] };
try {
  existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
} catch (e) {
  console.log('No existing data.json found, starting fresh.');
}
const existingTitles = existing.items.map(i => `- [${i.source}] ${i.title}`).join('\n');

const SYSTEM_PROMPT = `You are a research assistant for Logisticiti Connect, a global freight-forwarding / logistics LinkedIn page.

Search the web WORLDWIDE (not just one region) for what has happened in the last ~12 hours in:
- Ocean shipping lines (Maersk, MSC, CMA CGM, Hapag-Lloyd, COSCO, ONE, Evergreen, ZIM, etc.)
- Major freight forwarders (DHL, Kuehne+Nagel, DSV, C.H. Robinson, Expeditor, Bollore, etc.)
- Airlines / air cargo carriers (Emirates SkyCargo, Cathay Cargo, Lufthansa Cargo, Qatar Airways Cargo, etc.)
- Port operators & terminals (DP World, PSA, APM Terminals, etc.)
- Customs, trade policy, and tariff news affecting shippers
- Major trade media coverage (The Loadstar, FreightWaves, Journal of Commerce, Air Cargo News, Lloyd's List, Reuters, Bloomberg)

Cover multiple regions — Middle East/Gulf, Asia-Pacific, Europe, Americas, Africa — not just one.

CRITICAL — AVOID DUPLICATES:
The portal already has these stories published. Do NOT repeat any of them, or near-duplicates of the same underlying event:
${existingTitles || '(none yet)'}

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this shape:

{
  "items": [
    {
      "code": "MKT-001",            // short code: MKT- for market/rate/trend news, ADV- for press releases/company announcements/advisories, OPN- for expert opinion/analysis
      "category": "market",         // one of: "market", "advisory", "opinion"
      "title": "string, under 90 chars, plain and specific",
      "summary": "2-3 sentences IN YOUR OWN WORDS, never copied text from the source, describing what happened and why it matters to a freight forwarder or shipper",
      "source": "Publication or company name",
      "url": "https://... the real source URL you found",
      "date": "YYYY-MM-DD"
    }
  ]
}

Rules:
- 8 to 12 NEW items, a mix across all three categories and multiple regions/companies — never more than 2 items about the same company.
- Only include items you actually found via search, with real working source URLs. Never invent a URL.
- Never quote source text directly — always paraphrase in fresh wording.
- Prioritize the most recent and most consequential items for someone in freight forwarding, ocean, or air cargo.`;

async function generate() {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: 'Research the latest global freight forwarding, ocean, and air cargo news and return the JSON now.' }
      ],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // The model may emit multiple content blocks (search calls + text). Grab the text blocks.
  const textBlocks = data.content.filter(b => b.type === 'text').map(b => b.text);
  const raw = textBlocks.join('\n').trim();

  // Strip accidental code fences if present.
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('Could not parse model output as JSON:\n', cleaned);
    throw err;
  }

  // Keep a rolling window: newest items + a slice of the previous ones,
  // capped so the portal doesn't grow unbounded.
  const MAX_ITEMS = 24;
  const combined = [...parsed.items, ...existing.items].slice(0, MAX_ITEMS);

  const output = {
    last_synced: new Date().toISOString(),
    items: combined
  };

  fs.writeFileSync(DATA_PATH, JSON.stringify(output, null, 2));
  console.log(`Added ${parsed.items.length} new items. Portal now has ${combined.length} total.`);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
