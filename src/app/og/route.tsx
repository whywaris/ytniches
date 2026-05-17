import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Find Your Perfect YouTube Niche'
  const type = searchParams.get('type') ?? 'default'
  const cpm = searchParams.get('cpm') ?? ''
  const competition = searchParams.get('competition') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#F5F0E8',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Logo */}
        <div style={{
          fontSize: '28px',
          fontWeight: 900,
          color: '#1A1612',
          marginBottom: '32px',
          display: 'flex',
        }}>
          YT<span style={{ color: '#E8402A' }}>Niches</span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: type === 'niche' ? '52px' : '64px',
          fontWeight: 900,
          color: '#1A1612',
          lineHeight: 1.1,
          marginBottom: '24px',
          maxWidth: '900px',
        }}>
          {title}
        </div>

        {/* Badges for niche pages */}
        {type === 'niche' && cpm && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <div style={{
              background: '#fff',
              border: '1.5px solid #E0D9CE',
              borderRadius: '100px',
              padding: '8px 20px',
              fontSize: '18px',
              color: '#8A7F72',
            }}>
              CPM: {cpm}
            </div>
            {competition && (
              <div style={{
                background: competition === 'Low' ? '#EBF5EF' : competition === 'Medium' ? '#FEF6E8' : '#FDF0ED',
                border: '1.5px solid #C2E0CE',
                borderRadius: '100px',
                padding: '8px 20px',
                fontSize: '18px',
                color: competition === 'Low' ? '#2A7A4B' : competition === 'Medium' ? '#A06B00' : '#E8402A',
              }}>
                {competition} competition
              </div>
            )}
          </div>
        )}

        {/* Subtext */}
        <div style={{
          fontSize: '22px',
          color: '#8A7F72',
          maxWidth: '700px',
        }}>
          {type === 'niche'
            ? '30 video ideas • Script hooks • Title templates • 30-day calendar'
            : 'Discover 1,200+ profitable YouTube niches with complete content kits'
          }
        </div>

        {/* Bottom right — URL */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          right: '80px',
          fontSize: '18px',
          color: '#8A7F72',
        }}>
          ytniches.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
