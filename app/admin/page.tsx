import { isAdmin } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';
import AdminClient from './ui';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const authenticated = await isAdmin();
  if (!authenticated) return <AdminClient authenticated={false} teams={[]} />;

  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('teams')
    .select('*,departments(name,token),players(*)')
    .order('created_at');
  if (error) throw error;

  const teams = await Promise.all(
    (data || []).map(async (team: any) => ({
      ...team,
      logo_url: team.logo_path
        ? (await sb.storage.from('competition-files').createSignedUrl(team.logo_path, 3600)).data?.signedUrl || ''
        : '',
      players: await Promise.all(
        (team.players || [])
          .sort((a: any, b: any) => a.jersey_number - b.jersey_number)
          .map(async (player: any) => ({
            ...player,
            photo_url:
              (await sb.storage.from('competition-files').createSignedUrl(player.photo_path, 3600)).data?.signedUrl || '',
          })),
      ),
    })),
  );

  return <AdminClient authenticated teams={teams} />;
}
