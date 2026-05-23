import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl

    const stage = searchParams.get('stage')
    const pricingType = searchParams.get('pricing_type')
    const search = searchParams.get('search')
    const faceless = searchParams.get('faceless')

    let query = supabase
      .from('automation_tools')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })

    if (stage) {
      query = query.eq('stage', stage)
    }

    if (pricingType) {
      query = query.eq('pricing_type', pricingType)
    }

    if (faceless === 'true') {
      query = query.eq('is_faceless_friendly', true)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,tagline.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
}
