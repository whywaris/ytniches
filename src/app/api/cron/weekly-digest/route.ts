import { NextRequest, NextResponse } from 'next/server'
import { sendWeeklyDigest } from '@/lib/email/digest'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes — large batch sends can take time

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await sendWeeklyDigest()
    console.log('Weekly digest result:', result)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Weekly digest cron failed:', error)
    return NextResponse.json(
      { error: 'Digest failed', details: String(error) },
      { status: 500 }
    )
  }
}
