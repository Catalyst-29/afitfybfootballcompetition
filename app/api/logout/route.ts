import { NextResponse } from 'next/server'; import { clearTeamSession } from '@/lib/session';
export async function POST(){ await clearTeamSession(); return NextResponse.json({ok:true}); }
