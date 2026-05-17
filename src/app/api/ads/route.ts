import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('ad_settings')
    .select('*')
    .single()

  if (!data) {
    return NextResponse.json({
      adsense_enabled: false,
      custom_ads_enabled: false,
    })
  }

  return NextResponse.json(data)
}
