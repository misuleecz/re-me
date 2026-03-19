import { Section } from '@/lib/types'
import { COLORS, SECTION_COLORS } from '@/lib/colors'

interface SectionBlockProps {
  section: Section
  index: number
}

export default function SectionBlock({ section, index }: SectionBlockProps) {
  const colorKey = SECTION_COLORS[section.type]
  const color = COLORS[colorKey]
  const isEven = index % 2 === 0

  return (
    <div
      className="border-2 border-ink p-6 md:p-10"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.emoji}</span>
          <span
            className="font-display font-black text-xs uppercase tracking-[0.3em]"
            style={{ color: color.text }}
          >
            {section.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {section.duration && (
            <span
              className="font-body text-xs opacity-60 tracking-wide"
              style={{ color: color.text }}
            >
              {section.duration}
            </span>
          )}
          <span
            className="font-display font-black text-xs opacity-30"
            style={{ color: color.text }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Source */}
      {section.source && (
        <p
          className="font-body text-xs uppercase tracking-widest opacity-50 mb-2"
          style={{ color: color.text }}
        >
          — {section.source}
        </p>
      )}

      {/* Title */}
      <h2
        className="font-display font-black text-2xl md:text-4xl leading-tight mb-4"
        style={{ color: color.text }}
      >
        {section.title}
      </h2>

      {/* Description */}
      <p
        className="font-body text-base md:text-lg leading-relaxed opacity-80 max-w-2xl"
        style={{ color: color.text }}
      >
        {section.description}
      </p>

      {/* Tags + Link */}
      <div className="flex items-center justify-between mt-8 flex-wrap gap-4">
        {/* Tags */}
        {section.tags && section.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {section.tags.map((tag) => (
              <span
                key={tag}
                className="font-body text-xs px-2 py-1 border rounded-none"
                style={{ borderColor: color.text, color: color.text, opacity: 0.6 }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {section.link && (
          <a
            href={section.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-bold text-sm uppercase tracking-widest border-2 px-5 py-2.5
              hover:opacity-70 transition-opacity ml-auto"
            style={{ borderColor: color.text, color: color.text }}
          >
            Open →
          </a>
        )}
      </div>
    </div>
  )
}
