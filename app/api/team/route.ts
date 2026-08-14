import { NextResponse } from 'next/server'; import { getTeamSession } from '@/lib/session'; import { supabaseAdmin } from '@/lib/supabase';
export async function POST(req: Request){
 const departmentId=await getTeamSession(); if(!departmentId) return NextResponse.json({error:'Session expired.'},{status:401});
 const form=await req.formData(); const file=form.get('logo'); if(!(file instanceof File)) return NextResponse.json({error:'PNG logo is required.'},{status:400});
 if(file.type!=='image/png') return NextResponse.json({error:'Logo must be PNG.'},{status:400}); if(file.size>5*1024*1024) return NextResponse.json({error:'Logo must be 5MB or smaller.'},{status:400});
 const sb=supabaseAdmin(); const {data: existing}=await sb.from('teams').select('*').eq('department_id',departmentId).maybeSingle();
 if(existing?.final_submitted) return NextResponse.json({error:'Registration is locked after final submission.'},{status:403});
 const path=`teams/${departmentId}/logo-${Date.now()}.png`; const bytes=Buffer.from(await file.arrayBuffer()); const up=await sb.storage.from('competition-files').upload(path,bytes,{contentType:'image/png',upsert:true}); if(up.error) return NextResponse.json({error:up.error.message},{status:500});
 if(existing?.logo_path) await sb.storage.from('competition-files').remove([existing.logo_path]);
 const payload={department_id:departmentId,logo_path:path,status:'pending',rejection_reason:null}; const q=existing?sb.from('teams').update(payload).eq('id',existing.id).select().single():sb.from('teams').insert(payload).select().single(); const {data,error}=await q; if(error) return NextResponse.json({error:error.message},{status:500}); return NextResponse.json({ok:true,team:data});
}
