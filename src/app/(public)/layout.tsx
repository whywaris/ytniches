import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AnnouncementBar } from '@/components/homepage/AnnouncementBar'
import { AdsenseScript } from '@/components/ads/AdsenseScript'
import { CookieBanner } from '@/components/shared/CookieBanner'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdsenseScript />
      <Navbar />
      <div className="flex-1 pt-16">
        <AnnouncementBar />
        {children}
      </div>
      <Footer />
      <CookieBanner />
    </>
  )
}
