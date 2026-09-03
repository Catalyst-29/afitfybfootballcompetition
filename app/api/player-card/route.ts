import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import sharp, { type OverlayOptions } from 'sharp';
import { isAdmin } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
const esc=(v:unknown)=>String(v??'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]||c));

export async function GET(req:Request){
 if(!(await isAdmin()))return NextResponse.json({error:'Unauthorized'},{status:401});
 const id=new URL(req.url).searchParams.get('id');if(!id)return NextResponse.json({error:'Missing player id.'},{status:400});
 const sb=supabaseAdmin();const {data:p,error}=await sb.from('players').select('*,teams!inner(departments(name))').eq('id',id).maybeSingle();
 if(error||!p)return NextResponse.json({error:error?.message||'Player not found.'},{status:404});
 const {data:photo,error:photoError}=await sb.storage.from('competition-files').download(p.photo_path);
 if(photoError||!photo)return NextResponse.json({error:photoError?.message||'Player photo unavailable.'},{status:500});

 const W=1024,H=1536,name=esc(`${p.first_name} ${p.last_name}`).toUpperCase(),dept=esc(p.teams.departments.name),pos=esc(p.position==='Forward'?'Attacker':p.position),foot=esc(p.preferred_foot),jersey=esc(String(p.jersey_number).padStart(2,'0'));
 const state=String(p.status||'pending'),label=esc(state.toUpperCase()),color=state==='approved'?'#08a447':state==='rejected'?'#d43a43':'#d79720',dark=state==='approved'?'#057b35':state==='rejected'?'#a8212b':'#986413';
 const nameSize=Math.max(28,Math.min(40,730/Math.max(name.length,16))),deptSize=Math.max(21,Math.min(30,850/Math.max(dept.length,20)));
 const bg=Buffer.from(`<svg width="1024" height="1536" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="b" cx="50%" cy="31%" r="72%"><stop stop-color="#173852"/><stop offset=".55" stop-color="#061a2d"/><stop offset="1" stop-color="#010713"/></radialGradient><linearGradient id="g"><stop stop-color="#ffe08a"/><stop offset=".45" stop-color="#bd7c1c"/><stop offset="1" stop-color="#f6c95f"/></linearGradient><pattern id="m" width="54" height="46" patternUnits="userSpaceOnUse"><path d="M27 0 54 15 47 46H7L0 15Z" fill="none" stroke="#9ab0ca" stroke-opacity=".055"/></pattern><filter id="x"><feGaussianBlur stdDeviation="15"/></filter></defs><rect width="1024" height="1536" fill="#010713"/><rect x="62" y="42" width="900" height="1452" rx="48" fill="url(#b)" stroke="url(#g)" stroke-width="4"/><rect x="67" y="47" width="890" height="1442" rx="43" fill="url(#m)"/><g opacity=".75" filter="url(#x)" fill="#fff"><ellipse cx="150" cy="405" rx="92" ry="24"/><ellipse cx="874" cy="405" rx="92" ry="24"/></g><g fill="#fff" opacity=".85">${[90,120,151,182,212].map((x,i)=>`<circle cx="${x}" cy="${385-Math.abs(2-i)*10}" r="11"/>`).join('')}${[812,842,873,904,934].map((x,i)=>`<circle cx="${x}" cy="${385-Math.abs(2-i)*10}" r="11"/>`).join('')}</g></svg>`);
 const fg=Buffer.from(`<svg width="1024" height="1536" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="f" x2="0" y2="1"><stop stop-color="#03101f" stop-opacity="0"/><stop offset=".68" stop-color="#03101f" stop-opacity=".2"/><stop offset="1" stop-color="#03101f"/></linearGradient><linearGradient id="g"><stop stop-color="#f9da7b"/><stop offset=".5" stop-color="#bf7e1e"/><stop offset="1" stop-color="#f6c95f"/></linearGradient><linearGradient id="s" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient><filter id="d"><feDropShadow dy="5" stdDeviation="7" flood-opacity=".7"/></filter></defs><rect x="66" y="500" width="892" height="570" fill="url(#f)"/>
 <text x="143" y="292" fill="#fff" font-family="Arial" font-size="34" font-weight="900" letter-spacing="2" filter="url(#d)">AFIT CUP</text><text x="149" y="325" fill="#fff" font-family="Arial" font-size="25" font-weight="900">2026/2027</text>
 <path d="M754 90h135q28 0 28 28v121l-95 57-96-57V118q0-28 28-28Z" fill="#06172a" fill-opacity=".85" stroke="#eab143" stroke-width="3"/><text x="821" y="205" text-anchor="middle" fill="url(#g)" font-family="Arial" font-size="74" font-weight="900">#${jersey}</text>
 <text x="106" y="927" fill="#fff" font-family="Arial" font-size="${nameSize}" font-weight="900" letter-spacing="1" filter="url(#d)">${name}</text>
 <path d="M112 975h27l-14-9Z" fill="#eab143"/><path d="M116 979v16l9 5 9-5v-16" fill="none" stroke="#eab143" stroke-width="3"/><text x="153" y="998" fill="#9db2e9" font-family="Arial" font-size="${deptSize}" font-weight="600">${dept}</text>
 <rect x="90" y="1035" width="844" height="310" rx="22" fill="#07182a" fill-opacity=".85" stroke="#61748e"/><path d="M512 1035v310M90 1190h844" stroke="#61748e"/>
 <g fill="none" stroke="#eab143" stroke-width="3"><rect x="128" y="1080" width="54" height="44"/><circle cx="155" cy="1102" r="9"/><path d="M128 1089h13v-9h28v9h13M128 1115h13v9h28v-9"/></g><text x="211" y="1095" fill="#9db2e9" font-family="Arial" font-size="24">Position</text><text x="211" y="1137" fill="#fff" font-family="Arial" font-size="29" font-weight="700">${pos}</text>
 <g transform="translate(565 1080) rotate(-42 26 26)" fill="none" stroke="#eab143" stroke-width="4"><rect x="7" y="17" width="58" height="24"/><path d="M18 17v10m12-10v7m12-7v10m12-10v7"/></g><text x="646" y="1095" fill="#9db2e9" font-family="Arial" font-size="24">Height</text><text x="646" y="1137" fill="#fff" font-family="Arial" font-size="29" font-weight="700">${esc((p.height_cm/100).toFixed(2))} m</text>
 <circle cx="155" cy="1266" r="34" fill="#fff" stroke="#eab143" stroke-width="2"/><path d="M121 1266a34 34 0 0 1 17-29v58a34 34 0 0 1-17-29ZM172 1237a34 34 0 0 1 0 58Z" fill="#078d3c"/><text x="211" y="1257" fill="#9db2e9" font-family="Arial" font-size="24">Nationality</text><text x="211" y="1299" fill="#fff" font-family="Arial" font-size="29" font-weight="700">Nigerian</text>
 <g transform="translate(575 1223)" fill="#eab143"><ellipse cx="18" cy="34" rx="12" ry="28" transform="rotate(-20 18 34)"/><circle cx="37" cy="8" r="7"/><circle cx="48" cy="15" r="6"/><circle cx="54" cy="26" r="5"/></g><text x="646" y="1257" fill="#9db2e9" font-family="Arial" font-size="24">Preferred Foot</text><text x="646" y="1299" fill="#fff" font-family="Arial" font-size="29" font-weight="700">${foot}</text>
 <rect x="646" y="1360" width="220" height="58" rx="29" fill="url(#s)" stroke="#55ed8e" stroke-width="2"/><circle cx="681" cy="1389" r="17" fill="none" stroke="#fff" stroke-width="3"/><path d="m672 1389 7 7 13-15" fill="none" stroke="#fff" stroke-width="3"/><text x="709" y="1398" fill="#fff" font-family="Arial" font-size="21" font-weight="900">${label}</text><text x="410" y="1400" text-anchor="middle" fill="#d6a840" font-family="Arial" font-size="15" font-weight="700" letter-spacing="4">OFFICIAL PLAYER CARD</text></svg>`);

 const portrait=await sharp(Buffer.from(await photo.arrayBuffer())).rotate().resize(800,875,{fit:'cover',position:'attention'}).modulate({saturation:1.05}).png().toBuffer();
 const logo=await sharp(await readFile(join(process.cwd(),'public','afit-logo-transparent.png'))).resize(76,76,{fit:'contain'}).png().toBuffer();
 const layers:OverlayOptions[]=[{input:bg,left:0,top:0},{input:portrait,left:112,top:86},{input:logo,left:154,top:155},{input:fg,left:0,top:0}];
 const png=await sharp({create:{width:W,height:H,channels:4,background:'#010713'}}).composite(layers).png({quality:95}).toBuffer();
 const safe=`${p.jersey_number}-${p.first_name}-${p.last_name}-player-card`.replace(/[^a-z0-9-_]+/gi,'-');
 return new NextResponse(new Uint8Array(png),{headers:{'Content-Type':'image/png','Content-Disposition':`attachment; filename="${safe}.png"`,'Cache-Control':'private, no-store'}});
}
