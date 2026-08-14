import { redirect } from 'next/navigation';
import { getTeamSession, hasAcceptedRules } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';
import RulesClient from './ui';

export const dynamic = 'force-dynamic';

export default async function RulesPage() {
  const departmentId = await getTeamSession();
  if (!departmentId) redirect('/');
  const sb = supabaseAdmin();
  const [{ data: department }, { data: team }] = await Promise.all([
    sb.from('departments').select('name').eq('id', departmentId).single(),
    sb.from('teams').select('id').eq('department_id', departmentId).maybeSingle(),
  ]);
  if (!department) redirect('/');
  if (team) redirect('/dashboard');
  if (await hasAcceptedRules(departmentId)) redirect('/team-setup');
  return <RulesClient departmentName={department.name} />;
}
