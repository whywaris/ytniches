'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ background: '#F5F0E8', fontFamily: 'sans-serif' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#1A1612', marginBottom: '16px' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#8A7F72', marginBottom: '32px', maxWidth: '400px' }}>
            We encountered an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#E8402A',
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '9999px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
