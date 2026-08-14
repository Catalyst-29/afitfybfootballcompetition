import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing player id.' }, { status: 400 });
  const sb = supabaseAdmin();
  const { data: player } = await sb.from('players').select('first_name,last_name,jersey_number,photo_path').eq('id', id).maybeSingle();
  if (!player) return NextResponse.json({ error: 'Player not found.' }, { status: 404 });
  const { data, error } = await sb.storage.from('competition-files').download(player.photo_path);
  if (error || !data) return NextResponse.json({ error: error?.message || 'Photo unavailable.' }, { status: 500 });
  const bytes = await data.arrayBuffer();
  const safe = `${player.jersey_number}-${player.first_name}-${player.last_name}`.replace(/[^a-z0-9-_]+/gi, '-');
  return new NextResponse(bytes, { headers: { 'Content-Type': 'image/jpeg', 'Content-Disposition': `attachment; filename="${safe}.jpg"` } });
}
