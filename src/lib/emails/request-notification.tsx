import {
  Html, Head, Body, Container, Heading,
  Text, Section, Hr
} from '@react-email/components'

interface RequestNotificationProps {
  userName: string
  userEmail: string
  requestType: 'niche' | 'prompts'
  nicheName: string
  description: string
  requestId: string
}

export function RequestNotificationEmail({
  userName,
  userEmail,
  requestType,
  nicheName,
  description,
}: RequestNotificationProps) {
  const typeLabel = requestType === 'niche' ? 'Niche Request' : 'Prompts Request'
  const typeEmoji = requestType === 'niche' ? '📺' : '✍️'

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#F5F0E8', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px' }}>
          <Heading style={{ fontSize: '22px', color: '#1A1612', marginBottom: '4px' }}>
            {typeEmoji} New {typeLabel}
          </Heading>
          <Text style={{ color: '#8A7F72', fontSize: '14px', marginTop: '0' }}>
            A user has submitted a new request on YTNiches
          </Text>

          <Hr style={{ borderColor: '#E0D9CE', margin: '24px 0' }} />

          <Section>
            <Text style={{ fontSize: '12px', color: '#8A7F72', margin: '0 0 4px' }}>REQUEST TYPE</Text>
            <Text style={{ fontSize: '15px', color: '#1A1612', margin: '0 0 16px', fontWeight: 'bold' }}>
              {typeLabel}
            </Text>

            <Text style={{ fontSize: '12px', color: '#8A7F72', margin: '0 0 4px' }}>NICHE NAME</Text>
            <Text style={{ fontSize: '15px', color: '#1A1612', margin: '0 0 16px', fontWeight: 'bold' }}>
              {nicheName}
            </Text>

            <Text style={{ fontSize: '12px', color: '#8A7F72', margin: '0 0 4px' }}>DESCRIPTION</Text>
            <Text style={{ fontSize: '14px', color: '#1A1612', margin: '0 0 16px', lineHeight: '1.6' }}>
              {description || '—'}
            </Text>

            <Hr style={{ borderColor: '#E0D9CE', margin: '16px 0' }} />

            <Text style={{ fontSize: '12px', color: '#8A7F72', margin: '0 0 4px' }}>SUBMITTED BY</Text>
            <Text style={{ fontSize: '14px', color: '#1A1612', margin: '0' }}>
              {userName} — {userEmail}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
