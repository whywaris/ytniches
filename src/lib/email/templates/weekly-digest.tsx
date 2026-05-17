import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr, Row, Column, Link,
} from '@react-email/components'
import * as React from 'react'

export interface WeeklyDigestEmailProps {
  userName: string
  userEmail: string
  unsubscribeToken: string
  weekRange: string
  newNiches: {
    name: string
    category: string
    cpm_min: number
    cpm_max: number
    competition_level: string
    slug: string
  }[]
  featuredNiche: {
    name: string
    category: string
    cpm_min: number
    cpm_max: number
    competition_level: string
    slug: string
    why_featured: string
    top_video_idea: string
  }
  topRequestedNiches: {
    title: string
    votes_count: number
    category: string
    status: string
  }[]
  totalNiches: number
  stats: {
    new_niches_count: number
    new_requests_count: number
  }
}

export function WeeklyDigestEmail({
  userName,
  unsubscribeToken,
  weekRange,
  newNiches,
  featuredNiche,
  topRequestedNiches,
  totalNiches,
  stats,
}: WeeklyDigestEmailProps) {
  const baseUrl = 'https://ytniches.com'
  const unsubscribeUrl = `${baseUrl}/api/email/unsubscribe?token=${unsubscribeToken}&type=weekly_digest`

  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>

          {/* HEADER */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>YTNiches</Heading>
            <Text style={headerSubStyle}>Your Weekly Niche Digest</Text>
            <Text style={weekRangeStyle}>{weekRange}</Text>
          </Section>

          {/* GREETING */}
          <Section style={sectionStyle}>
            <Text style={greetingStyle}>Hey {userName || 'Creator'} 👋</Text>
            <Text style={bodyTextStyle}>
              Here is your weekly roundup from YTNiches. This week we added{' '}
              <strong>{stats.new_niches_count} new niches</strong> to the library. You now have
              access to <strong>{totalNiches}+ curated niches</strong> to grow your channel.
            </Text>
          </Section>

          <Hr style={dividerStyle} />

          {/* FEATURED NICHE OF THE WEEK */}
          <Section style={sectionStyle}>
            <Text style={eyebrowStyle}>⭐ FEATURED NICHE OF THE WEEK</Text>
            <Heading style={sectionHeadingStyle}>{featuredNiche.name}</Heading>

            <Section style={featuredCardStyle}>
              <Row>
                <Column style={{ width: '50%' }}>
                  <Text style={statLabelStyle}>Category</Text>
                  <Text style={statValueStyle}>{featuredNiche.category}</Text>
                </Column>
                <Column style={{ width: '50%' }}>
                  <Text style={statLabelStyle}>CPM Range</Text>
                  <Text style={statValueStyle}>${featuredNiche.cpm_min}–${featuredNiche.cpm_max}</Text>
                </Column>
              </Row>
              <Row>
                <Column style={{ width: '50%' }}>
                  <Text style={statLabelStyle}>Competition</Text>
                  <Text style={statValueStyle}>{featuredNiche.competition_level}</Text>
                </Column>
                <Column style={{ width: '50%' }}>
                  <Text style={statLabelStyle}>Top Video Idea</Text>
                  <Text style={statValueStyle}>{featuredNiche.top_video_idea}</Text>
                </Column>
              </Row>
              <Text style={bodyTextStyle}>{featuredNiche.why_featured}</Text>
            </Section>

            <Button href={`${baseUrl}/niches/${featuredNiche.slug}`} style={primaryButtonStyle}>
              View Full Niche Kit →
            </Button>
          </Section>

          <Hr style={dividerStyle} />

          {/* NEW NICHES THIS WEEK */}
          {newNiches.length > 0 && (
            <Section style={sectionStyle}>
              <Text style={eyebrowStyle}>🆕 NEW NICHES THIS WEEK</Text>
              <Heading style={sectionHeadingStyle}>{newNiches.length} Niches Added</Heading>

              {newNiches.slice(0, 6).map((niche, i) => (
                <Section key={i} style={nicheRowStyle}>
                  <Row>
                    <Column style={{ width: '60%' }}>
                      <Text style={nicheTitleStyle}>
                        <Link href={`${baseUrl}/niches/${niche.slug}`} style={nicheLinkStyle}>
                          {niche.name}
                        </Link>
                      </Text>
                      <Text style={nicheCatStyle}>{niche.category}</Text>
                    </Column>
                    <Column style={{ width: '20%', textAlign: 'center' }}>
                      <Text style={nicheStatStyle}>${niche.cpm_min}–${niche.cpm_max}</Text>
                      <Text style={nicheStatLabelStyle}>CPM</Text>
                    </Column>
                    <Column style={{ width: '20%', textAlign: 'center' }}>
                      <Text style={{
                        ...competitionBadgeStyle,
                        color: niche.competition_level === 'Low'
                          ? '#2A7A4B'
                          : niche.competition_level === 'Medium'
                          ? '#A06B00'
                          : '#E8402A',
                      }}>
                        {niche.competition_level}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}

              {newNiches.length > 6 && (
                <Text style={moreTextStyle}>+ {newNiches.length - 6} more niches added this week</Text>
              )}

              <Button href={`${baseUrl}/niches`} style={secondaryButtonStyle}>
                Browse All New Niches →
              </Button>
            </Section>
          )}

          <Hr style={dividerStyle} />

          {/* TOP REQUESTED NICHES */}
          {topRequestedNiches.length > 0 && (
            <Section style={sectionStyle}>
              <Text style={eyebrowStyle}>🗳️ TOP REQUESTED NICHES</Text>
              <Heading style={sectionHeadingStyle}>Community is asking for these</Heading>
              <Text style={bodyTextStyle}>
                Vote on niches you want added — most voted get priority.
              </Text>

              {topRequestedNiches.slice(0, 3).map((req, i) => (
                <Section key={i} style={requestRowStyle}>
                  <Row>
                    <Column style={{ width: '15%', textAlign: 'center' }}>
                      <Text style={voteCountStyle}>{req.votes_count}</Text>
                      <Text style={voteLabelStyle}>votes</Text>
                    </Column>
                    <Column style={{ width: '65%' }}>
                      <Text style={requestTitleStyle}>{req.title}</Text>
                      <Text style={requestCatStyle}>{req.category}</Text>
                    </Column>
                    <Column style={{ width: '20%', textAlign: 'right' }}>
                      <Text style={{
                        ...statusBadgeStyle,
                        color: req.status === 'under_review' ? '#5B47CC' : '#8A7F72',
                      }}>
                        {req.status === 'under_review' ? '🔍 In Review' : '⏳ Pending'}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))}

              <Button href={`${baseUrl}/dashboard/request`} style={secondaryButtonStyle}>
                Vote on Requests →
              </Button>
            </Section>
          )}

          <Hr style={dividerStyle} />

          {/* CTA */}
          <Section style={{ ...sectionStyle, textAlign: 'center' }}>
            <Heading style={ctaHeadingStyle}>Ready to grow your channel?</Heading>
            <Text style={bodyTextStyle}>Head to your dashboard and explore this week&apos;s new niches.</Text>
            <Button href={`${baseUrl}/dashboard`} style={primaryButtonStyle}>
              Open Dashboard →
            </Button>
          </Section>

          {/* FOOTER */}
          <Hr style={dividerStyle} />
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              You are receiving this because you are a YTNiches Pro member.
            </Text>
            <Text style={footerTextStyle}>
              <Link href={`${baseUrl}/dashboard/settings/emails`} style={footerLinkStyle}>
                Email Preferences
              </Link>
              {' · '}
              <Link href={unsubscribeUrl} style={footerLinkStyle}>
                Unsubscribe from digest
              </Link>
            </Text>
            <Text style={footerTextStyle}>YTNiches · ytniches.com</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#F5F0E8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}
const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  overflow: 'hidden',
}
const headerStyle: React.CSSProperties = {
  backgroundColor: '#1A1612',
  padding: '32px 40px',
  textAlign: 'center',
}
const logoStyle: React.CSSProperties = {
  color: '#E8402A',
  fontSize: '28px',
  fontWeight: '900',
  margin: '0 0 4px 0',
}
const headerSubStyle: React.CSSProperties = {
  color: 'rgba(245,240,232,0.7)',
  fontSize: '14px',
  margin: '0',
}
const weekRangeStyle: React.CSSProperties = {
  color: 'rgba(245,240,232,0.4)',
  fontSize: '12px',
  margin: '8px 0 0 0',
}
const sectionStyle: React.CSSProperties = { padding: '28px 40px' }
const greetingStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1A1612',
  margin: '0 0 12px 0',
}
const bodyTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#8A7F72',
  lineHeight: '1.6',
  margin: '0 0 16px 0',
}
const eyebrowStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#E8402A',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 8px 0',
}
const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1A1612',
  margin: '0 0 16px 0',
}
const featuredCardStyle: React.CSSProperties = {
  backgroundColor: '#F5F0E8',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
}
const statLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#8A7F72',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '0 0 2px 0',
}
const statValueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1A1612',
  margin: '0 0 12px 0',
}
const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#E8402A',
  color: '#FFFFFF',
  borderRadius: '100px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}
const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#1A1612',
  border: '1.5px solid #E0D9CE',
  borderRadius: '100px',
  padding: '10px 22px',
  fontSize: '13px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}
const nicheRowStyle: React.CSSProperties = {
  borderBottom: '1px solid #E0D9CE',
  padding: '10px 0',
}
const nicheTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1A1612',
  margin: '0 0 2px 0',
}
const nicheLinkStyle: React.CSSProperties = {
  color: '#1A1612',
  textDecoration: 'none',
}
const nicheCatStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8A7F72',
  margin: '0',
}
const nicheStatStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#1A1612',
  margin: '0',
}
const nicheStatLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#8A7F72',
  margin: '0',
}
const competitionBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  margin: '0',
}
const moreTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#8A7F72',
  margin: '8px 0 16px 0',
}
const requestRowStyle: React.CSSProperties = {
  backgroundColor: '#F5F0E8',
  borderRadius: '10px',
  padding: '12px',
  marginBottom: '8px',
}
const voteCountStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '900',
  color: '#E8402A',
  margin: '0',
}
const voteLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  color: '#8A7F72',
  margin: '0',
}
const requestTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1A1612',
  margin: '0 0 2px 0',
}
const requestCatStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8A7F72',
  margin: '0',
}
const statusBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  margin: '0',
}
const ctaHeadingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#1A1612',
  margin: '0 0 8px 0',
  textAlign: 'center',
}
const dividerStyle: React.CSSProperties = {
  borderColor: '#E0D9CE',
  margin: '0',
}
const footerStyle: React.CSSProperties = {
  padding: '24px 40px',
  textAlign: 'center',
}
const footerTextStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#8A7F72',
  margin: '4px 0',
}
const footerLinkStyle: React.CSSProperties = {
  color: '#8A7F72',
  textDecoration: 'underline',
}
