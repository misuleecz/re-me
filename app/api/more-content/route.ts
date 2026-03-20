import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isAuthedFromRequest } from '@/lib/auth'
import type { Section } from '@/lib/types'

const client = new Anthropic()

interface RatedSection {
  title: string
  type: string
  description: string
  rating: 'up' | 'down' | null
  note: string | null
}

export async function POST(request: NextRequest) {
  if (!isAuthedFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sections }: { sections: RatedSection[] } = await request.json()

  const liked = sections.filter(s => s.rating === 'up')
  const skipped = sections.filter(s => s.rating === 'down')
  const neutral = sections.filter(s => s.rating === null)

  const prompt = `You are curating a personalized daily AI + design digest for a product designer named Michaela. She is on maternity leave, building AI fluency, and currently working on a white-label sport apps design system with a Claude + Figma MCP integration.

Here are the sections she saw today:

${neutral.map(s => `- [no rating] ${s.type}: "${s.title}"`).join('\n')}
${liked.map(s => `- [👍 liked] ${s.type}: "${s.title}"`).join('\n')}
${skipped.map(s => `- [👎 skipped${s.note ? ` — reason: "${s.note}"` : ''}] ${s.type}: "${s.title}"`).join('\n')}

Based on what she liked and what she skipped, generate exactly 4 new content sections she would find valuable. Learn from her skips (especially the reasons) and lean into what she liked. Make descriptions personal and specific to her context — don't be generic.

Return ONLY a valid JSON array of 4 sections with this exact structure (no markdown, no explanation):
[
  {
    "type": "article" | "podcast" | "video" | "concept" | "thought" | "trending" | "tool" | "stat" | "tip",
    "emoji": string,
    "label": string,
    "title": string,
    "source": string | null,
    "description": string,
    "link": string | null,
    "duration": string | null,
    "tags": string[]
  }
]`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Strip markdown code blocks if Claude wrapped the JSON
  const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim()
  const sections_result: Section[] = JSON.parse(cleaned)

  return NextResponse.json({ sections: sections_result })
}
