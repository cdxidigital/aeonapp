// @ts-nocheck
import { Astro as C } from './astro.js'

export function createVisuals() {
  const root = { AeonAstro: C }
  const factory = function(root) {
  'use strict';
  const C=root.AeonAstro;
  const paths={
    today:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    chart:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 3v4.5m0 9V21M3 12h4.5m9 0H21M5.6 5.6l3.2 3.2m6.4 6.4 3.2 3.2M5.6 18.4l3.2-3.2m6.4-6.4 3.2-3.2"/>',
    people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h1m6 0h1m-8 3h1"/>',
    journal:'<path d="M5 3h14a1 1 0 0 1 1 1v17H6a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Zm1 0v15m-3 0h17M10 8h6m-6 4h6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',chevron:'<path d="m9 5 7 7-7 7"/>',left:'<path d="m15 5-7 7 7 7"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
    bookmark:'<path d="M6 3h12v18l-6-4-6 4Z"/>',plus:'<path d="M12 4v16M4 12h16"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="m10 3-.5 3-3 1L4 5.5 2 9l2.5 2v3L2 16l2 3.5L6.5 18l3 1 .5 3h4l.5-3 3-1 2.5 1.5 2-3.5-2.5-2v-3L22 9l-2-3.5L17.5 7l-3-1L14 3Z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.2"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',share:'<path d="M12 16V3M7 8l5-5 5 5M5 12v9h14v-9"/>',check:'<path d="m5 12 4 4L19 6"/>',trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',edit:'<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/>',spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',night:'<path d="M20 15.5A8.5 8.5 0 1 1 8.5 4 6.8 6.8 0 0 0 20 15.5Z"/>'
  };
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function icon(name){return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.spark}</svg>`;}
  function moon(angle,size=40){
    const phase=C.mod(angle),a=phase>180?360-phase:phase,r=18,rx=Math.max(.001,Math.abs(Math.cos(a*Math.PI/180)*r)),sweep=a<90?0:1;
    return `<svg class="moon" width="${size}" height="${size}" viewBox="-21 -21 42 42" aria-hidden="true"><circle r="18" fill="var(--sage-ink)" opacity=".19"/><g${phase>180?' transform="scale(-1 1)"':''}><path d="M0 -18 A18 18 0 0 1 0 18 A${rx.toFixed(4)} 18 0 0 ${sweep} 0 -18Z" fill="var(--sage-ink)" opacity=".8"/></g><circle r="18" fill="none" stroke="var(--sage-ink)" stroke-width=".5" opacity=".3"/></svg>`;
  }
  function celestial(angle){return `<svg class="celestial" viewBox="0 0 400 400" fill="none" aria-hidden="true"><defs><radialGradient id="orb-glow"><stop stop-color="#e3c79f"/><stop offset=".65" stop-color="#d5b78c"/><stop offset="1" stop-color="#b89a74"/></radialGradient></defs><g stroke="#7f8b72" opacity=".35" stroke-width=".7"><circle cx="200" cy="200" r="152"/><circle cx="200" cy="200" r="170" stroke-dasharray="1 7"/><ellipse cx="200" cy="200" rx="185" ry="82" transform="rotate(-40 200 200)"/><ellipse cx="200" cy="200" rx="176" ry="114" transform="rotate(40 200 200)"/><path d="M200 16v368M16 200h368"/></g><circle cx="200" cy="200" r="92" fill="url(#orb-glow)"/><g stroke="#8d775c" opacity=".2" stroke-width=".5">${Array.from({length:17},(_,i)=>`<path d="M${120+i*10} ${155-Math.sin(i)*10}q-30 55 0 90"/>`).join('')}</g><circle cx="200" cy="200" r="93" stroke="#9a8565" opacity=".4"/><g fill="#6a785b"><circle cx="78" cy="109" r="3.5"/><circle cx="338" cy="268" r="3"/><circle cx="246" cy="47" r="2"/></g><g stroke="#66765b" stroke-width="1"><path d="M310 94v14m-7-7h14M90 287v12m-6-6h12M283 337v8m-4-4h8"/></g><text x="200" y="206" text-anchor="middle" fill="#625641" font-family="Georgia,serif" font-size="22" opacity=".65">${C.GLYPHS[Math.floor(C.mod(angle)/30)]}</text></svg>`;}
  function point(lon,r,asc){const a=(180-(lon-asc))*Math.PI/180;return {x:260+r*Math.cos(a),y:260+r*Math.sin(a)};}
  function wheel(chart){
    const asc=chart.asc??0,cusps=chart.cusps,lines=[],labels=[],ticks=[];
    for(let i=0;i<72;i++){const a=point(i*5,225,asc),b=point(i*5,i%6===0?211:219,asc);ticks.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="wheel-detail" opacity=".45" stroke-width=".6"/>`);}
    for(let i=0;i<12;i++){const p=point(i*30+15,242,asc);labels.push(`<text x="${p.x}" y="${p.y+5}" font-family="Georgia,serif" font-size="17" text-anchor="middle" class="wheel-sign">${C.GLYPHS[i]}</text>`);}
    if(cusps)for(let i=0;i<12;i++){const a=point(cusps[i],107,asc),b=point(cusps[i],210,asc),p=point(cusps[i]+C.mod(cusps[(i+1)%12]-cusps[i])/2,119,asc);lines.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="wheel-line" stroke-width="${i%3===0?1.5:.7}"/><text x="${p.x}" y="${p.y+3}" font-size="9" font-family="Arial,sans-serif" text-anchor="middle" class="wheel-sign">${i+1}</text>`);}
    const asp=C.aspects(chart.bodies,chart.bodies,3,true).slice(0,13).map(e=>{const a=point(chart.bodies.find(b=>b.body===e.left).lon,105,asc),b=point(chart.bodies.find(b=>b.body===e.right).lon,105,asc);return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${e.kind==='flow'?'#83937c':e.kind==='focus'?'#b68e60':'#9e8bac'}" opacity=".42" stroke-width=".8"${e.kind==='focus'?' stroke-dasharray="3 4"':''}/>`;}).join('');
    const sorted=[...chart.bodies].sort((a,b)=>a.lon-b.lon);
    const planets=sorted.map((b,i)=>{const prev=sorted[(i+sorted.length-1)%sorted.length],next=sorted[(i+1)%sorted.length],close=C.distance(prev.lon,b.lon)<12||C.distance(next.lon,b.lon)<12,r=close?150+(i%3)*20:173,p=point(b.lon,r,asc),a=point(b.lon,200,asc),z=point(b.lon,208,asc);return `<line x1="${a.x}" y1="${a.y}" x2="${z.x}" y2="${z.y}" class="wheel-accent" stroke-width="1.3"/><text x="${p.x}" y="${p.y+7}" font-family="Georgia,serif" font-size="23" text-anchor="middle">${C.SYMBOLS[b.body]}</text>`;}).join('');
    return `<svg class="chart-wheel" viewBox="0 0 520 520" role="img" aria-label="Tropical birth chart. All placements are also available in the adjacent table."><circle cx="260" cy="260" r="257" fill="none" class="wheel-line"/><circle cx="260" cy="260" r="225" fill="none" class="wheel-line"/><circle cx="260" cy="260" r="210" fill="none" class="wheel-line"/><circle cx="260" cy="260" r="107" fill="none" class="wheel-line"/>${ticks.join('')}${labels.join('')}${lines.join('')}${asp}${planets}${chart.asc!=null?'<text x="28" y="264" font-size="8" class="wheel-sign" font-family="Arial,sans-serif">ASC</text>':''}<circle cx="260" cy="260" r="22" fill="var(--surface)"/><text x="260" y="267" font-size="23" text-anchor="middle" fill="var(--gold)">✳</text></svg>`;
  }
  function dateLabel(key,options={day:'numeric',month:'long',year:'numeric'}){return new Intl.DateTimeFormat('en-AU',{...options,timeZone:'UTC'}).format(new Date(key+'T12:00:00Z'));}
  function offset(n){const s=n<0?'−':'+';n=Math.abs(n);return `UTC${s}${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;}
  root.AeonUI={esc,icon,moon,celestial,wheel,dateLabel,offset};
}
  factory(root)
  return root.AeonUI
}

export const UI = createVisuals()
