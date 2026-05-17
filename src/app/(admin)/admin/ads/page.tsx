import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import { AdsManager } from '@/components/admin/AdsManager'

export const metadata: Metadata = {
  title: 'Ads',
  robots: { index: false, follow: false },
}

export default async function AdminAdsPage() {
  const supabase = createAdminClient()

  const { data: settings } = await supabase
    .from('ad_settings')
    .select('*')
    .single()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-[#1A1612]">Ads Manager</h1>
        <p className="text-[#8A7F72] text-sm mt-1">
          Manage Google AdSense and custom ad sections for tools, blog, and public pages
        </p>
      </div>
      <AdsManager initialSettings={settings} />
    </div>
  )
}

