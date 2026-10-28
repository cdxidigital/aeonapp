// @ts-nocheck
import { Astro as C } from './astro.js'

function create(C) {
  'use strict';
  const KEY='aeon.private.v1';
  const sample={id:'sample-maya',name:'Maya',birthDate:'1993-11-14',birthTime:'08:30',precision:'exact',place:{name:'Perth, Australia',lat:-31.9523,lng:115.8613,zone:'Australia/Perth'},sample:true};
  const samplePerson={id:'sample-alex',name:'Alex',birthDate:'1991-06-08',birthTime:'15:45',precision:'exact',place:{name:'Melbourne, Australia',lat:-37.8136,lng:144.9631,zone:'Australia/Melbourne'},sample:true};
  function defaults(){let zone='Australia/Perth';try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone||zone;}catch{}return {schema:1,profile:null,people:[],entries:[],bookmarks:[],prefs:{tone:'gentle',house:'porphyry',theme:'light',zone}};}
  function text(v,max,label,empty=false){if(typeof v!=='string'||v.length>max||(!empty&&!v.trim()))throw Error(`Invalid ${label}.`);return v;}
  function id(v){const s=text(v,100,'record ID');if(!/^[a-zA-Z0-9_-]+$/.test(s))throw Error('Invalid record ID.');return s;}
  function profile(p){C.validateProfile(p,true);return {id:id(p.id),name:p.name.trim(),birthDate:p.birthDate,birthTime:p.precision==='unknown'?'12:00':p.birthTime,precision:p.precision,fold:p.fold??0,place:{name:p.place.name,lat:p.place.lat,lng:p.place.lng,zone:p.place.zone},updatedAt:typeof p.updatedAt==='string'?p.updatedAt:null};}
  function normalize(raw){
    if(!raw||raw.schema!==1||!Array.isArray(raw.people)||!Array.isArray(raw.entries)||!Array.isArray(raw.bookmarks)||!raw.prefs)throw Error('This is not an AEON v1 backup.');
    if(raw.people.length>100||raw.entries.length>2000||raw.bookmarks.length>2000)throw Error('This backup contains too many records.');
    const p=raw.prefs;
    if(!['gentle','direct','playful'].includes(p.tone)||!['porphyry','whole','equal'].includes(p.house)||!['light','dark','system'].includes(p.theme)||!C.validZone(p.zone))throw Error('Invalid reading preferences.');
    const entries=raw.entries.map(e=>{C.validateDate(e.date);return {id:id(e.id),date:e.date,text:text(e.text,10000,'reflection'),mood:text(e.mood||'Open',30,'mood'),prompt:text(e.prompt||'',500,'prompt',true),updatedAt:text(e.updatedAt||new Date().toISOString(),50,'timestamp')};});
    const bookmarks=raw.bookmarks.map(b=>{C.validateDate(b.date);return {id:id(b.id),date:b.date,name:text(b.name,60,'chart name'),topic:text(b.topic,100,'reading topic'),title:text(b.title,300,'reading title'),text:text(b.text,5000,'reading'),context:text(b.context,300,'reading context'),zone:text(b.zone,100,'reading timezone'),engine:text(b.engine||C.VERSION,150,'engine'),precision:text(b.precision||'exact',30,'precision'),kind:['flow','focus','friction'].includes(b.kind)?b.kind:'focus',chartRevision:text(b.chartRevision||'',1000,'chart revision',true)};});
    const people=raw.people.map(profile);
    if(new Set(people.map(x=>x.id)).size!==people.length||new Set(entries.map(x=>x.id)).size!==entries.length||new Set(bookmarks.map(x=>x.id)).size!==bookmarks.length)throw Error('Duplicate record IDs in backup.');
    return {schema:1,profile:raw.profile?profile(raw.profile):null,people,entries,bookmarks,prefs:{tone:p.tone,house:p.house,theme:p.theme,zone:p.zone}};
  }
  function load(storage){try{const s=storage.getItem(KEY);return {state:s?normalize(JSON.parse(s)):defaults(),warning:null};}catch{return {state:defaults(),warning:'Saved data could not be loaded. Import a backup if you have one; export before clearing this browser.'};}}
  function save(storage,state){try{storage.setItem(KEY,JSON.stringify(normalize(state)));return true;}catch{return false;}}
  function backup(state){return JSON.stringify({...normalize(state),exportedAt:new Date().toISOString(),application:'AEON'},null,2);}
  return {KEY,sample,samplePerson,defaults,normalize,profile,load,save,backup};
}

export const Store = create(C)
