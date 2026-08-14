import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { setTeamSession } from '@/lib/session';
export async function POST(req: Request) {
  const { token } = await req.json();
  const clean = String(token || '').trim().toUpperCase();
  const { data } = await supabaseAdmin().from('departments').select('id,name').eq('token', clean).maybeSingle();
  if (!data) return NextResponse.json({ error: 'Invalid registration token.' }, { status: 401 });
  await setTeamSession(data.id);
  return NextResponse.json({ ok: true, department: data.name });
}
