import type { Metadata } from 'next'
import { Unbounded, DM_Sans } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Re:Me — Daily AI + Design Digest',
  description: 'A personal diary of AI, design, and the future.',
  openGraph: {
    title: 'Re:Me',
    description: 'A personal diary of AI, design, and the future.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${unbounded.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  )
}
