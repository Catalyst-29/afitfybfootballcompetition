import { redirect } from 'next/navigation';
import { getTeamSession, hasAcceptedRules } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';
import TeamSetupClient from './ui';

export const dynamic = 'force-dynamic';

export default async function TeamSetupPage() {
  const departmentId = await getTeamSession();
  if (!departmentId) redirect('/');
  if (!(await hasAcceptedRules(departmentId))) redirect('/rules');

  const sb = supabaseAdmin();
  const [{ data: department }, { data: team }] = await Promise.all([
    sb.from('departments').select('name').eq('id', departmentId).single(),
    sb.from('teams').select('id').eq('department_id', departmentId).maybeSingle(),
  ]);
  if (!department) redirect('/');
  if (team) redirect('/dashboard');
  return <TeamSetupClient departmentName={department.name} />;
}
