'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/useAuthStore'
import { useToast } from '@/components/ui/Toast'
import { Loader2 } from 'lucide-react'
import type { User } from '@/types'
import Link from 'next/link'

interface SettingsClientProps {
  user: User | null
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter()
  const { clearUser, setUser, user: storeUser } = useAuthStore()
  const { showToast } = useToast()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState(user?.display_name ?? user?.email?.split('@')[0] ?? '')
  const [saving, setSaving] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-[#8A7F72]" />
      </div>
    )
  }

  async function handleSave() {
    if (!displayName.trim()) {
      showToast('Name cannot be empty')
      return
    }
    setSaving(true)

    try {
      const res = await fetch('/api/user/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        showToast(data.error ?? 'Failed to save', 'error')
      } else {
        if (storeUser) setUser({ ...storeUser, display_name: displayName.trim() })
        showToast('Name updated successfully')
        router.refresh()
      }
    } catch {
      showToast('Network error — please try again', 'error')
    }

    setSaving(false)
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    setDeleting(true)
    await supabase.from('users').delete().eq('id', user!.id)
    await supabase.auth.signOut()
    clearUser()
    router.push('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">

      {/* Profile Section */}
      <div className="bg-card border border-border rounded-[20px] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Profile</h2>
        <p className="text-sm text-muted mb-6">Update your display name</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={user.email ?? ''}
              disabled
              className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-muted bg-secondary cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent bg-card transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>

      {/* Plan Section */}
      <div className="bg-card border border-border rounded-[20px] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Plan & Billing</h2>
        <p className="text-sm text-muted mb-6">Manage your subscription</p>

        <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
          <div>
            <div className="text-sm font-semibold text-foreground capitalize">
              {user.plan ?? 'free'} Plan
            </div>
            <div className="text-xs text-muted mt-0.5">
              {user.plan === 'lifetime'
                ? 'Lifetime access — no renewal needed'
                : user.plan === 'pro'
                ? 'Monthly subscription — cancel anytime'
                : '5 free niches included'}
            </div>
          </div>
          {user.plan === 'free' && (
            <Link
              href="/pricing"
              className="bg-accent text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-accent-hover transition-all"
            >
              Upgrade
            </Link>
          )}
          {user.plan === 'pro' && (
            <Link
              href="/api/lemonsqueezy/portal"
              className="border border-foreground text-foreground px-4 py-2 rounded-full text-xs font-semibold hover:bg-foreground hover:text-background transition-all"
            >
              Manage
            </Link>
          )}
          {user.plan === 'lifetime' && (
            <span className="text-xs text-[#2A7A4B] font-semibold bg-[#EBF5EF] px-3 py-1 rounded-full border border-[#C2E0CE]">
              Lifetime ✓
            </span>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card border border-destructive/30 rounded-[20px] p-6">
        <h2 className="text-lg font-semibold text-accent mb-1">Danger Zone</h2>
        <p className="text-sm text-muted mb-6">
          Permanently delete your account and all saved niches.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="border-[1.5px] border-accent text-accent px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-accent hover:text-white transition-all"
        >
          Delete account
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-[20px] p-8 max-w-md w-full border border-border">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Are you sure?
            </h3>
            <p className="text-sm text-muted mb-6">
              This will permanently delete your account and all saved niches.
              Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full border-[1.5px] border-border rounded-xl px-4 py-3 text-sm text-foreground bg-card mb-4 focus:outline-none focus:border-accent"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteInput('')
                }}
                className="flex-1 border border-border text-muted py-2.5 rounded-full text-sm font-semibold hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== 'DELETE' || deleting}
                className="flex-1 bg-accent text-white py-2.5 rounded-full text-sm font-semibold hover:bg-accent-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
