import type { Metadata } from 'next'
import AutomationToolsManager from '@/components/admin/AutomationToolsManager'

export const metadata: Metadata = {
  title: 'YT Tools — Admin',
  robots: { index: false, follow: false },
}

export default function AdminAutomationToolsPage() {
  return <AutomationToolsManager />
}
