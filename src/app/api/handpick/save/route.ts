import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please log in to save niches' }, { status: 401 })
    }

    const body = await request.json() as { handpick_id?: string }
    if (!body.handpick_id) {
      return NextResponse.json({ error: 'handpick_id is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('saved_handpick_niches')
      .insert({ user_id: user.id, handpick_id: body.handpick_id })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ message: 'Already saved' })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please log in' }, { status: 401 })
    }

    const body = await request.json() as { handpick_id?: string }
    if (!body.handpick_id) {
      return NextResponse.json({ error: 'handpick_id is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('saved_handpick_niches')
      .delete()
      .eq('user_id', user.id)
      .eq('handpick_id', body.handpick_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
