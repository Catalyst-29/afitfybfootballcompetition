import { supabaseAdmin } from './supabase';
import { getTeamSession } from './session';

export async function getDashboardData() {
  const departmentId = await getTeamSession();
  if (!departmentId) return null;
  const sb = supabaseAdmin();
  const { data: department } = await sb.from('departments').select('*').eq('id', departmentId).single();
  if (!department) return null;
  const { data: team } = await sb.from('teams').select('*').eq('department_id', departmentId).maybeSingle();
  let players: any[] = [];
  if (team) {
    const res = await sb.from('players').select('*').eq('team_id', team.id).order('jersey_number');
    players = res.data || [];
  }
  return { department, team, players };
}
