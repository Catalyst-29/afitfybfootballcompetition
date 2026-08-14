import { NextResponse } from 'next/server';
import { getTeamSession, setRulesAccepted } from '@/lib/session';

export async function POST() {
  const departmentId = await getTeamSession();
  if (!departmentId) return NextResponse.json({ error: 'Session expired.' }, { status: 401 });
  await setRulesAccepted(departmentId);
  return NextResponse.json({ ok: true });
}
