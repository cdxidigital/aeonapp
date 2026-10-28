// @ts-nocheck
import { Ecliptic, GeoVector, SiderealTime, e_tilt, MakeTime, MoonPhase, SearchMoonPhase } from 'astronomy-engine'

function create(A) {
  'use strict';
  const VERSION = 'aeon-1.0.0 / astronomy-engine-2.1.19';
  const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const GLYPHS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const BODIES = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
  const SYMBOLS = {Sun:'☉',Moon:'☽',Mercury:'☿',Venus:'♀',Mars:'♂',Jupiter:'♃',Saturn:'♄',Uranus:'♅',Neptune:'♆',Pluto:'♇'};
  const ASPECTS = [
    {name:'conjunction',angle:0,kind:'focus',verb:'conjunct'},
    {name:'sextile',angle:60,kind:'flow',verb:'sextile'},
    {name:'square',angle:90,kind:'friction',verb:'square'},
    {name:'trine',angle:120,kind:'flow',verb:'trine'},
    {name:'opposition',angle:180,kind:'focus',verb:'opposite'}
  ];
  const mod = n => ((n % 360) + 360) % 360;
  const delta = (a,b) => mod(a-b+180)-180;
  const distance = (a,b) => Math.abs(delta(a,b));
  const radians = n => n*Math.PI/180;
  const degrees = n => n*180/Math.PI;
  const pad = n => String(n).padStart(2,'0');
  const formatters = new Map();
  const positionCache = new Map();
  const chartCache = new Map();
  function validZone(zone) { try { new Intl.DateTimeFormat('en',{timeZone:zone}).format(); return true; } catch { return false; } }
  function parts(date, zone) {
    if (!formatters.has(zone)) formatters.set(zone,new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));
    return Object.fromEntries(formatters.get(zone).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
  }
  function dateKey(date = new Date(), zone = 'UTC') { const p=parts(date,zone); return `${p.year}-${pad(p.month)}-${pad(p.day)}`; }
  function addDays(key, n) { const d=new Date(key+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
  function validateDate(key) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw Error('Enter a complete birth date.');
    const d=new Date(key+'T12:00:00Z');
    if (!Number.isFinite(+d) || d.toISOString().slice(0,10)!==key || d.getUTCFullYear()<1900 || d.getUTCFullYear()>2100) throw Error('Choose a valid date between 1900 and 2100.');
    return d;
  }
  function resolveLocal(key, time, zone) {
    validateDate(key);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw Error('Enter a valid local time.');
    if (!validZone(zone)) throw Error('Choose a valid IANA timezone, such as Australia/Perth.');
    const [y,m,d]=key.split('-').map(Number), [h,min]=time.split(':').map(Number);
    const nominal=Date.UTC(y,m-1,d,h,min), offsets=new Set();
    for(let i=-36;i<=36;i+=3) {
      const probe=nominal+i*3600000,p=parts(new Date(probe),zone);
      offsets.add(Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-probe);
    }
    const matches=[];
    for(const offset of offsets) {
      const value=nominal-offset,p=parts(new Date(value),zone);
      if(p.year===y&&p.month===m&&p.day===d&&p.hour===h&&p.minute===min) matches.push({iso:new Date(value).toISOString(),offsetMinutes:offset/60000});
    }
    return matches.sort((a,b)=>a.iso.localeCompare(b.iso));
  }
  function firstLocal(key, zone) {
    for(let m=0;m<=180;m++) {
      const matches=resolveLocal(key,`${pad(Math.floor(m/60))}:${pad(m%60)}`,zone);
      if(matches.length) return new Date(matches[0].iso);
    }
    throw Error('This local date is not supported. Check the date and timezone.');
  }
  function positions(date) {
    const key=new Date(date).toISOString();
    if(positionCache.has(key)) return positionCache.get(key);
    const result=BODIES.map(body=>{
      const e=A.Ecliptic(A.GeoVector(body,new Date(date),true));
      return {body,lon:mod(e.elon),lat:e.elat,sign:Math.floor(mod(e.elon)/30)};
    });
    if(positionCache.size>300) positionCache.clear();
    positionCache.set(key,result);
    return result;
  }
  function angles(date,lat,lng) {
    const theta=radians(mod(A.SiderealTime(date)*15+lng));
    const eps=radians(A.e_tilt(A.MakeTime(date)).tobl), phi=radians(lat);
    let asc=mod(degrees(Math.atan2(-Math.cos(phi)*Math.cos(theta),Math.cos(phi)*Math.sin(theta)*Math.cos(eps)+Math.sin(phi)*Math.sin(eps))));
    const east=lon=>-Math.sin(theta)*Math.cos(radians(lon))+Math.cos(theta)*Math.sin(radians(lon))*Math.cos(eps);
    if(east(asc)<0) asc=mod(asc+180);
    const mc=mod(degrees(Math.atan2(Math.sin(theta),Math.cos(theta)*Math.cos(eps))));
    return {asc,mc};
  }
  function houseCusps(asc,mc,system,lat) {
    if(system==='whole') return Array.from({length:12},(_,i)=>mod(Math.floor(asc/30)*30+i*30));
    if(system==='equal') return Array.from({length:12},(_,i)=>mod(asc+i*30));
    if(system!=='porphyry') throw Error('Unsupported house system.');
    if(Math.abs(lat)>66) return null;
    const starts=[asc,mod(mc+180),mod(asc+180),mc],cusps=[];
    for(let q=0;q<4;q++) {
      const span=mod(starts[(q+1)%4]-starts[q]);
      if(span>180 || span<0.0001) return null;
      for(let k=0;k<3;k++) cusps.push(mod(starts[q]+span*k/3));
    }
    return cusps;
  }
  function houseFor(lon,cusps) { if(!cusps) return null; for(let i=0;i<12;i++) if(mod(lon-cusps[i])<mod(cusps[(i+1)%12]-cusps[i])-1e-9) return i+1; return null; }
  function validateProfile(p,adult=false) {
    if(!p||typeof p!=='object'||typeof p.name!=='string'||!p.name.trim()||p.name.length>60) throw Error('Add a name of up to 60 characters.');
    validateDate(p.birthDate);
    if(!['exact','approximate','unknown'].includes(p.precision)) throw Error('Choose the accuracy of the birth time.');
    if(!p.place||!Number.isFinite(p.place.lat)||Math.abs(p.place.lat)>89.8||!Number.isFinite(p.place.lng)||Math.abs(p.place.lng)>180||typeof p.place.name!=='string'||p.place.name.length>150||!validZone(p.place.zone)) throw Error('Check the location, coordinates and timezone.');
    if(adult) {
      const now=new Date(),cutoff=new Date(Date.UTC(now.getUTCFullYear()-18,now.getUTCMonth(),now.getUTCDate()));
      if(+new Date(p.birthDate+'T00:00:00Z')>+cutoff) throw Error('AEON is for adults aged 18 and over.');
    }
    const matches=resolveLocal(p.birthDate,p.precision==='unknown'?'12:00':p.birthTime,p.place.zone);
    if(!matches.length) throw Error('That time did not exist locally because the clocks changed. Please check it.');
    if(matches.length>1&&!Number.isInteger(p.fold)) throw Error('The clocks repeated this time. Choose the correct UTC offset.');
    if(p.fold!=null&&(p.fold<0||p.fold>=matches.length)) throw Error('Choose a valid UTC offset for this time.');
    return matches[p.fold||0];
  }
  function chart(profile,system='porphyry') {
    const resolved=validateProfile(profile);
    const cacheKey=[resolved.iso,system,profile.precision,profile.place.lat,profile.place.lng,profile.fold||0].join('|');
    const cached=chartCache.get(cacheKey);
    if(cached) return cached;
    const date=new Date(resolved.iso), base=positions(date);
    let interval=null,samples=[];
    if(profile.precision==='unknown') {
      const start=firstLocal(profile.birthDate,profile.place.zone),end=firstLocal(addDays(profile.birthDate,1),profile.place.zone);
      interval={start:start.toISOString(),end:end.toISOString()};
      for(let i=0;i<=24;i++) samples.push(positions(new Date(+start+(+end-+start-1000)*i/24)));
    } else if(profile.precision==='approximate') {
      interval={start:new Date(+date-3600000).toISOString(),end:new Date(+date+3600000).toISOString()};
      samples=[positions(new Date(interval.start)),positions(new Date(interval.end))];
    }
    const a=profile.precision==='unknown'?null:angles(date,profile.place.lat,profile.place.lng);
    const cusps=a?houseCusps(a.asc,a.mc,system,profile.place.lat):null;
    const before=positions(new Date(+date-21600000)),after=positions(new Date(+date+21600000));
    const bodies=base.map((b,i)=>{
      const variants=new Set([b.sign,...samples.map(s=>s[i].sign)]);
      const uncertainty=samples.length?Math.max(...samples.map(s=>Math.abs(delta(s[i].lon,b.lon)))):0;
      const speed=delta(after[i].lon,before[i].lon)*2;
      return {...b,signs:[...variants].sort((x,y)=>x-y),uncertainty,speed,retrograde:speed<0,house:houseFor(b.lon,cusps)};
    });
    const result={profileId:profile.id,date:date.toISOString(),offset:resolved.offsetMinutes,system,asc:a?.asc??null,mc:a?.mc??null,cusps,bodies,interval,precision:profile.precision,engine:VERSION};
    chartCache.set(cacheKey,result);
    return result;
  }
  function aspects(left,right,orb=4,same=false) {
    const out=[];
    for(let i=0;i<left.length;i++) for(let j=0;j<right.length;j++) {
      if(same&&j<=i) continue;
      const l=left[i],r=right[j];
      if((l.uncertainty||0)>1.5||(r.uncertainty||0)>1.5) continue;
      const separation=distance(l.lon,r.lon);
      for(const a of ASPECTS) {
        const gap=Math.abs(separation-a.angle);
        if(gap<=orb) out.push({left:l.body,right:r.body,...a,orb:gap,score:(orb-gap)+(i<5?1:0)+(j<5?0.8:0),id:`${l.body}-${a.name}-${r.body}`});
      }
    }
    return out.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
  }
  function daily(chartData,key,zone) {
    const candidates=resolveLocal(key,'12:00',zone);
    if(!candidates.length) throw Error('Cannot calculate midday for this date. Try a different date.');
    const date=new Date(candidates[0].iso), current=positions(date);
    const events=aspects(current,chartData.bodies,2.5).map(e=>({...e,score:e.score+(e.left==='Moon'?1.5:0)+(e.left==='Sun'?0.5:0)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    const chosen=[],topics=new Set();
    for(const e of events) { if(!topics.has(e.left)){chosen.push(e);topics.add(e.left);} if(chosen.length===3)break; }
    return {key,zone,date:date.toISOString(),events,chosen,positions:current,moon:moon(date)};
  }
  function moon(date) {
    const angle=A.MoonPhase(date),illumination=(1-Math.cos(radians(angle)))/2;
    const labels=['New moon','Waxing crescent','First quarter','Waxing gibbous','Full moon','Waning gibbous','Last quarter','Waning crescent'];
    return {angle,illumination,name:labels[Math.floor(mod(angle+22.5)/45)]};
  }
  function moonEvents(start,end) {
    const out=[];
    for(const angle of [0,90,180,270]) {
      let cursor=new Date(start);
      for(let i=0;i<3;i++) {
        const found=A.SearchMoonPhase(angle,cursor,40);
        if(!found||+found.date>+end)break;
        if(+found.date>=+start)out.push({angle,date:found.date.toISOString(),name:{0:'New moon',90:'First quarter',180:'Full moon',270:'Last quarter'}[angle]});
        cursor=new Date(+found.date+86400000);
      }
    }
    return out.sort((a,b)=>a.date.localeCompare(b.date));
  }
  function positionLabel(lon) {
    const normalized=mod(lon),sign=Math.floor(normalized/30),total=Math.floor((normalized-sign*30)*60);
    return {sign,name:SIGNS[sign],glyph:GLYPHS[sign],degree:`${Math.floor(total/60)}° ${pad(total%60)}′`};
  }
  return {VERSION,SIGNS,GLYPHS,BODIES,SYMBOLS,ASPECTS,mod,delta,distance,parts,dateKey,addDays,validateDate,validZone,resolveLocal,firstLocal,positions,angles,houseCusps,houseFor,validateProfile,chart,aspects,daily,moon,moonEvents,positionLabel};
}

export const Astro = create({ Ecliptic, GeoVector, SiderealTime, e_tilt, MakeTime, MoonPhase, SearchMoonPhase })
