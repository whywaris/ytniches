import type { Metadata } from 'next'
import { HandpickPageClient } from './HandpickPageClient'

export const metadata: Metadata = {
  title: 'HandPick Niches — Real YouTube Channels Earning Real Money',
  description:
    'Browse hand-curated real YouTube channels with verified earnings, subscriber counts, and niche tags. Get inspired by what\'s actually working.',
  alternates: { canonical: 'https://ytniches.com/handpick' },
}

export default function HandpickPage() {
  return <HandpickPageClient />
}
