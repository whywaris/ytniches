import type { Metadata } from 'next'
import { AnnouncementSettings } from '@/components/admin/AnnouncementSettings'

export const metadata: Metadata = {
  title: 'Announcements',
  robots: { index: false, follow: false },
}

export default function AdminAnnouncementsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#1A1612]">Announcement Bar</h1>
        <p className="text-[#8A7F72] text-sm mt-1">
          Control the announcement bar shown on public pages and dashboard
        </p>
      </div>
      <AnnouncementSettings />
    </div>
  )
}
