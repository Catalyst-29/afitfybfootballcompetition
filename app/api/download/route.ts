import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { isAdmin } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

function csvCell(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function safeName(value: unknown) {
  return String(value ?? '').trim().replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const teamId = new URL(req.url).searchParams.get('team');
  if (!teamId) return NextResponse.json({ error: 'Missing team.' }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: team, error: teamError } = await sb
    .from('teams')
    .select('id,departments(name)')
    .eq('id', teamId)
    .maybeSingle();
  if (teamError || !team) return NextResponse.json({ error: teamError?.message || 'Team not found.' }, { status: 404 });
  const departmentRelation = Array.isArray(team.departments) ? team.departments[0] : team.departments;
  const departmentName = departmentRelation?.name || 'Department';

  const { data: players, error: playersError } = await sb
    .from('players')
    .select('first_name,last_name,nationality,date_of_birth,jersey_number,position,height_cm,preferred_foot,status,photo_path')
    .eq('team_id', teamId)
    .eq('status', 'approved')
    .order('jersey_number');
  if (playersError) return NextResponse.json({ error: playersError.message }, { status: 500 });

  const approvedPlayers = players || [];
  const zip = new JSZip();
  const photosFolder = zip.folder('approved-player-photos');
  const headers = ['First Name', 'Last Name', 'Nationality', 'Date of Birth', 'Jersey Number', 'Position', 'Height (cm)', 'Preferred Foot', 'Status', 'Photo Filename'];
  const rows: string[] = [];
  const notes: string[] = [];

  await Promise.all(approvedPlayers.map(async (player) => {
    const photoFilename = `${String(player.jersey_number).padStart(2, '0')}-${safeName(player.first_name)}-${safeName(player.last_name)}.jpg`;
    rows.push([player.first_name, player.last_name, player.nationality, player.date_of_birth, player.jersey_number, player.position, player.height_cm, player.preferred_foot, player.status, photoFilename].map(csvCell).join(','));
    const { data: photo, error } = await sb.storage.from('competition-files').download(player.photo_path);
    if (error || !photo) {
      notes.push(`${player.first_name} ${player.last_name}: ${error?.message || 'Photo unavailable'}`);
      return;
    }
    photosFolder?.file(photoFilename, Buffer.from(await photo.arrayBuffer()));
  }));

  rows.sort((a, b) => {
    const aNumber = Number(a.match(/,"(\d+)",/)?.[1] || 0);
    const bNumber = Number(b.match(/,"(\d+)",/)?.[1] || 0);
    return aNumber - bNumber;
  });
  zip.file('approved-players.csv', [headers.map(csvCell).join(','), ...rows].join('\r\n'));
  zip.file('README.txt', `${departmentName}\r\nApproved player information export\r\n\r\nApproved players: ${approvedPlayers.length}\r\nGenerated: ${new Date().toISOString()}\r\n${notes.length ? `\r\nPhoto download notes:\r\n${notes.join('\r\n')}` : ''}`);

  const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const filename = `${safeName(departmentName)}-approved-player-information.zip`;
  return new NextResponse(new Uint8Array(archive), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
