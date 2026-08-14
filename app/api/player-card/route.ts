import { NextResponse } from 'next/server';
import sharp, { type OverlayOptions } from 'sharp';
import { isAdmin } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const escapeXml = (value: unknown) => String(value ?? '').replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character] || character);

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing player id.' }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: player, error: playerError } = await sb
    .from('players')
    .select('*,teams!inner(logo_path,departments(name))')
    .eq('id', id)
    .maybeSingle();
  if (playerError || !player) return NextResponse.json({ error: playerError?.message || 'Player not found.' }, { status: 404 });

  const { data: photo, error: photoError } = await sb.storage.from('competition-files').download(player.photo_path);
  if (photoError || !photo) return NextResponse.json({ error: photoError?.message || 'Player photo unavailable.' }, { status: 500 });

  const department = player.teams.departments.name;
  const dob = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${player.date_of_birth}T00:00:00Z`)).toUpperCase();
  const firstName = escapeXml(player.first_name).toUpperCase();
  const lastName = escapeXml(player.last_name).toUpperCase();
  const departmentName = escapeXml(department).toUpperCase();
  const position = escapeXml(player.position).toUpperCase();
  const foot = escapeXml(player.preferred_foot).toUpperCase();
  const nameSize = Math.max(48, Math.min(78, 900 / Math.max(firstName.length, lastName.length)));

  const background = Buffer.from(`<svg width="1200" height="700" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#020a16"/><stop offset="1" stop-color="#071d38"/></linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#e7bd54"/><stop offset=".5" stop-color="#9d6a12"/><stop offset="1" stop-color="#f2d273"/></linearGradient>
      <pattern id="lines" width="38" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="38" stroke="#ffffff" stroke-opacity=".025" stroke-width="2"/></pattern>
    </defs>
    <path d="M540 0 H1200 V700 H455 Z" fill="url(#bg)"/><path d="M540 0 H1200 V700 H455 Z" fill="url(#lines)"/>
    <path d="M540 0 L655 0 L560 700 L455 700 Z" fill="#031020" stroke="url(#gold)" stroke-width="5"/>
    <path d="M18 55 L55 18 H1145 L1182 55 V645 L1145 682 H55 L18 645 Z" fill="none" stroke="url(#gold)" stroke-width="5"/>
    <text x="655" y="65" fill="#d7a83b" font-family="Arial,sans-serif" font-size="25" font-weight="700" letter-spacing="5">OFFICIAL PLAYER CARD</text>
    <text x="650" y="148" fill="#ffffff" font-family="Arial,sans-serif" font-size="${nameSize}" font-weight="900">${firstName}</text>
    <text x="650" y="220" fill="url(#gold)" font-family="Arial,sans-serif" font-size="${nameSize}" font-weight="900">${lastName}</text>
    <line x1="650" y1="252" x2="1145" y2="252" stroke="#b48328" stroke-opacity=".7"/>
    <text x="650" y="300" fill="#c99630" font-family="Arial,sans-serif" font-size="18" font-weight="700">DATE OF BIRTH</text><text x="850" y="300" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="22">${dob}</text>
    <line x1="650" y1="326" x2="1145" y2="326" stroke="#b48328" stroke-opacity=".35"/>
    <text x="650" y="374" fill="#c99630" font-family="Arial,sans-serif" font-size="18" font-weight="700">JERSEY NUMBER</text><text x="850" y="374" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="24" font-weight="800">#${escapeXml(player.jersey_number)}</text>
    <line x1="650" y1="400" x2="1145" y2="400" stroke="#b48328" stroke-opacity=".35"/>
    <text x="650" y="448" fill="#c99630" font-family="Arial,sans-serif" font-size="18" font-weight="700">POSITION</text><text x="850" y="448" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="22">${position}</text>
    <line x1="650" y1="474" x2="1145" y2="474" stroke="#b48328" stroke-opacity=".35"/>
    <text x="650" y="522" fill="#c99630" font-family="Arial,sans-serif" font-size="18" font-weight="700">HEIGHT</text><text x="850" y="522" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="22">${escapeXml(player.height_cm)} CM</text>
    <line x1="650" y1="548" x2="1145" y2="548" stroke="#b48328" stroke-opacity=".35"/>
    <text x="650" y="596" fill="#c99630" font-family="Arial,sans-serif" font-size="18" font-weight="700">PREFERRED FOOT</text><text x="850" y="596" fill="#f3f6fb" font-family="Arial,sans-serif" font-size="22">${foot}</text>
    <text x="1140" y="651" text-anchor="end" fill="#e4b84e" font-family="Arial,sans-serif" font-size="17" font-weight="800" letter-spacing="1">${departmentName}</text>
    <text x="50" y="650" fill="#ffffff" font-family="Arial,sans-serif" font-size="23" font-weight="800">#${escapeXml(player.jersey_number)} · ${firstName} ${lastName}</text>
  </svg>`);

  const photoBuffer = await sharp(Buffer.from(await photo.arrayBuffer())).rotate().resize(560, 700, { fit: 'cover', position: 'attention' }).png().toBuffer();
  const composites: OverlayOptions[] = [{ input: photoBuffer, left: 0, top: 0 }, { input: background, left: 0, top: 0 }];

  if (player.teams.logo_path) {
    const { data: logo } = await sb.storage.from('competition-files').download(player.teams.logo_path);
    if (logo) {
      const logoBuffer = await sharp(Buffer.from(await logo.arrayBuffer())).resize(92, 92, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toBuffer();
      composites.push({ input: logoBuffer, left: 48, top: 44 });
    }
  }

  const png = await sharp({ create: { width: 1200, height: 700, channels: 4, background: '#020a16' } }).composite(composites).png().toBuffer();
  const safe = `${player.jersey_number}-${player.first_name}-${player.last_name}-player-card`.replace(/[^a-z0-9-_]+/gi, '-');
  return new NextResponse(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename="${safe}.png"`, 'Cache-Control': 'private, no-store' } });
}
