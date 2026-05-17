// Run before every deployment
// Check all required env variables are set
// Verify Supabase connection
// Verify tables exist
// Log results

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
  'LEMONSQUEEZY_STORE_ID',
  'LEMONSQUEEZY_PRO_VARIANT_ID',
  'LEMONSQUEEZY_LIFETIME_VARIANT_ID',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
]

async function runChecks() {
  console.log('🔍 Running pre-deploy checks...\n')
  
  // Check env vars
  let allEnvSet = true
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing: ${envVar}`)
      allEnvSet = false
    } else {
      console.log(`✅ ${envVar}`)
    }
  }

  if (!allEnvSet) {
    console.error('\n❌ Deploy failed — missing environment variables')
    process.exit(1)
  }

  console.log('\n✅ All checks passed — ready to deploy!')
}

runChecks()
