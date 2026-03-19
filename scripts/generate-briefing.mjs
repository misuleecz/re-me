import Anthropic from '@anthropic-ai/sdk'
import { tavily } from '@tavily/core'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY })

const today = new Date().toISOString().split('T')[0]
const outputPath = path.join(__dirname, '..', 'content', 'briefings', `${today}.json`)

if (fs.existsSync(outputPath)) {
  console.log(`Briefing for ${today} already exists. Skipping.`)
  process.exit(0)
}

// ── Step 1: Ask Claude what to search for today ──────────────────────────────

console.log('Step 1: Deciding what to search for...')

const topicsResponse = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1000,
  system: `You are curating a daily digest for Michaela — a senior product designer, ex-Group Head of Design, on maternity leave. She's building Figma MCP + Claude integrations, vibe-coding with Cursor/Lovable, very early on AI agents. She has limited time — only suggest things genuinely worth reading/listening/watching.

Respond ONLY with a JSON array of search queries (5-8 queries). Each query should find specific, recent, high-quality content. Focus on: AI × design, Figma AI / MCP, vibe coding, design systems + AI, AI agents for designers, product leadership.

Example format: ["figma ai new features 2025", "vibe coding design workflow tutorial", ...]`,
  messages: [{
    role: 'user',
    content: `Today is ${today}. What are the best search queries to find fresh, relevant content for Michaela today? Return only the JSON array.`
  }]
})

const queriesRaw = topicsResponse.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
const queries = JSON.parse(queriesRaw)
console.log(`  Queries: ${queries.join(', ')}`)

// ── Step 2: Search for real content ──────────────────────────────────────────

console.log('Step 2: Searching for real content...')

const searchResults = await Promise.all(
  queries.map(async (query) => {
    try {
      const result = await tavilyClient.search(query, {
        searchDepth: 'basic',
        maxResults: 3,
        includeAnswer: false,
      })
      return { query, results: result.results }
    } catch (e) {
      console.warn(`  Search failed for "${query}": ${e.message}`)
      return { query, results: [] }
    }
  })
)

// Format results for Claude
const searchContext = searchResults
  .flatMap(({ query, results }) =>
    results.map(r => `QUERY: ${query}\nTITLE: ${r.title}\nURL: ${r.url}\nSNIPPET: ${r.content?.slice(0, 300) || ''}`)
  )
  .join('\n\n---\n\n')

console.log(`  Found ${searchResults.reduce((n, r) => n + r.results.length, 0)} results`)

// ── Step 3: Generate the briefing using real search results ──────────────────

console.log('Step 3: Generating briefing...')

const briefingResponse = await anthropic.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 4000,
  system: `You are a personal AI curator for Michaela, a senior product designer on maternity leave.

WHO SHE IS:
- 15+ years in design, 6+ years in Figma at expert/lead level
- Ex-Group Head of Design — strategic, leadership mindset
- Expert in design systems, tokens, variables, component architecture
- Designed across: sport & event apps, CRM, B2B tools, price comparison, consumer apps
- Actively vibe-coding with Cursor, Lovable, Claude — has shipped real things
- Building a Figma MCP + Claude integration for her company's white-label sport apps design system
- Zero experience with n8n, Make, or automation tools — treat as curious beginner
- Very early on AI agents but very curious
- Interested in evolving toward product builder / product leadership

TOOLS SHE ALREADY USES — never explain how to use these:
- Figma (expert level), Figma MCP (already connected), Claude / Claude Code, Cursor, Lovable
- For these tools: ONLY include if there's a new feature, update, or meaningful change
- Never include tutorials, "how to use", or workflow guides for tools she already knows
- For tools she doesn't know yet: brief tip — what it is and why it might matter for her. Not a tutorial.

CONTENT PHILOSOPHY:
- Quality over quantity. 4 exceptional items beats 9 mediocre ones.
- Include between 4 and 9 sections — only what's genuinely worth her time
- No filler. Skip anything that's not directly relevant to her.
- Descriptions: warm, direct, like a smart friend briefing her — not a blog post
- Flag audio-friendly content (she listens on stroller walks with AirPods)
- Focus on WHAT'S NEW and WHY IT MATTERS FOR HER — not how to do things she already knows

AVAILABLE SECTION TYPES:
- podcast (🎧 / label: "Listen") — audio, great for stroller walks, flag duration
- video (📺 / label: "Watch") — needs screen, keep under 20min
- article (📖 / label: "Read") — short reads preferred
- concept (🧠 / label: "Concept of the day") — one AI/tech/product concept to understand
- thought (💭 / label: "Think about this") — one career or product question to sit with
- trending (🔥 / label: "Trending") — something blowing up worth knowing about
- tool (🛠️ / label: "Try this tool") — a specific AI tool she could try this week
- stat (📊 / label: "Did you know") — one surprising number or data point
- tip (💡 / label: "Quick tip") — one immediately actionable tip

CRITICAL: Use ONLY URLs from the search results provided. Never invent or guess URLs.

Respond ONLY with valid JSON:
{
  "date": "YYYY-MM-DD",
  "headline": "short punchy headline for the day theme (max 6 words)",
  "subheadline": "1-2 sentences why today's digest matters for her specifically",
  "emoji": "one emoji",
  "color": "one of: yellow, pink, lime, violet, orange, cyan, red, teal, magenta",
  "sections": [
    {
      "type": "section type",
      "emoji": "emoji",
      "label": "human label",
      "title": "title of the content",
      "source": "publication or podcast name, or null",
      "description": "2-4 sentences. What it is + why it matters for Michaela specifically.",
      "link": "URL from search results, or null",
      "duration": "e.g. ~18 min, ~5 min read, or null",
      "tags": ["2-4 tags"]
    }
  ]
}`,
  messages: [{
    role: 'user',
    content: `Today is ${today}. Here are the real search results from today:\n\n${searchContext}\n\nUsing ONLY content and URLs from these search results, generate Michaela's daily briefing. Be ruthlessly selective — only include things genuinely worth her limited time. Use the exact URLs from the search results. Respond only with the JSON object.`
  }]
})

const raw = briefingResponse.content[0].text.trim().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()

let briefing
try {
  briefing = JSON.parse(raw)
} catch (e) {
  console.error('Failed to parse JSON:', raw)
  process.exit(1)
}

briefing.date = today

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(briefing, null, 2))

console.log(`\n✓ Briefing saved: ${briefing.headline}`)
console.log(`  Sections: ${briefing.sections.length}`)
briefing.sections.forEach(s => console.log(`  ${s.emoji} ${s.label}: ${s.title}`))
