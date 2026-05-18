import type { BannerAd } from '@/types'

interface BannerAdProps {
  ad: BannerAd
}

export function BannerAdSlot({ ad }: BannerAdProps) {
  if (!ad.is_active) return null

  const image = (
    <img
      src={ad.image_url}
      alt={ad.alt_text || 'Advertisement'}
      className="w-full h-auto rounded-xl object-cover"
      loading="lazy"
    />
  )

  if (ad.click_url) {
    return (
      <a
        href={ad.click_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block"
      >
        {image}
      </a>
    )
  }

  return <div>{image}</div>
}
