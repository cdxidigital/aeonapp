// @ts-nocheck
import test from "node:test";
import assert from "node:assert/strict";
import { REPORT_STYLES, REPORT_TYPES, buildReportPages, createReportPdf } from "./report-studio.js";

const names = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"];
function fixture(precision = "exact") {
  const profile = {
    id:"test-profile", name:"Morgan Example", birthDate:"1991-01-22",
    birthTime:"14:30", precision,
    place:{name:"Perth, Western Australia",lat:-31.95,lng:115.86,zone:"Australia/Perth"}
  };
  const chart = {
    profileId:profile.id, system:"whole", precision, date:"1991-01-22T06:30:00.000Z",
    engine:"aeon-fixture / verified input required", asc: precision==="unknown"?null:88.3,
    cusps:precision==="unknown"?null:Array.from({length:12},(_,i)=>(60+i*30)%360),
    bodies:names.map((body,i)=>({
      body, sign:i%12, lon:(i*34+12)%360,
      house:precision==="unknown"?null:(i%12)+1, uncertainty:precision==="unknown"?.9:0,
      signs:[i%12], retrograde:false
    }))
  };
  const aspects=[{left:"Sun",right:"Moon",name:"sextile",orb:1.2,angle:60,kind:"flow"}];
  return {profile,chart,aspects};
}
test("catalog exposes six distinct dossiers and six artwork systems",()=>{
  assert.equal(REPORT_TYPES.length,6);
  assert.equal(REPORT_STYLES.length,6);
  assert.equal(new Set(REPORT_TYPES.map(x=>x.id)).size,6);
  assert.equal(new Set(REPORT_STYLES.map(x=>x.id)).size,6);
});
test("complete blueprint uses every planet, all houses, provenance and uncertainty",()=>{
  const d=buildReportPages(fixture());
  assert.equal(d.pages.length,50);
  assert.ok(d.pages.some(p=>p.art==="wheel"));
  for(const name of names)assert.equal(d.pages.filter(p=>p.kicker.startsWith("THE PLANETS / "+name.toUpperCase())).length,2);
  for(let i=1;i<=12;i++)assert.ok(d.pages.some(p=>p.title.startsWith("House "+i+":")));
  assert.ok(d.pages.some(p=>p.title==="The language of the sky"));
  assert.ok(d.pages.some(p=>p.title==="How this report was made"));
});
test("unknown birth time never manufactures rising or occupied houses",()=>{
  const unknown=fixture("unknown");
  const d=buildReportPages(unknown);
  const rising=d.pages.find(p=>p.title==="Three ways to begin").blocks.find(x=>x.label.includes("RISING"));
  assert.match(rising.text,/unavailable/);
  assert.match(d.pages.find(p=>p.title.startsWith("House 1:")).blocks[1].text,/unavailable/);
});
test("comparisons require explicit permission and a second calculated chart",()=>{
  const one=fixture(),two=fixture();
  two.profile={...two.profile,id:"test-second",name:"Taylor"};
  assert.throws(()=>buildReportPages({...one,type:"synastry"}),/permission/);
  assert.throws(()=>buildReportPages({...one,type:"synastry",partner:two.profile,partnerChart:two.chart,consent:false}),/permission/);
  const d=buildReportPages({...one,type:"synastry",partner:two.profile,partnerChart:two.chart,consent:true});
  assert.equal(d.pages.length,51);
  assert.ok(d.pages.some(x=>x.title==="Two skies, two people"));
});
test("annual diary uses supplied monthly sky snapshots only",()=>{
  const one=fixture();
  const timeline=Array.from({length:12},(_,i)=>({month:"Month "+(i+1)+" / 2027-01-15",events:[]}));
  const d=buildReportPages({...one,type:"year",timeline});
  assert.equal(d.pages.length,52);
  assert.equal(d.pages.filter(p=>p.art==="timeline").length,2);
  assert.match(d.pages.find(p=>p.art==="timeline").blocks[0].text,/No close major transit/);
});
test("binary export writes an indexed, independently addressable PDF",()=>{
  const result=createReportPdf({...fixture(),style:"sacred"});
  assert.equal(result.pageCount,50);
  assert.match(result.filename,/AEON-Morgan-Example-blueprint-sacred.pdf/);
  const bytes=Buffer.from(result.bytes);
  const pdf=bytes.toString("utf8");
  assert.ok(pdf.startsWith("%PDF-1.4\n"));
  assert.match(pdf,/\/Count 50\b/);
  assert.match(pdf,/Morgan Example/);
  assert.match(pdf,/Your natal wheel/);
  const startxref=Number(pdf.match(/startxref\n(\d+)\n%%EOF/)[1]);
  assert.equal(pdf.slice(startxref,startxref+4),"xref");
  const table=pdf.slice(startxref).split("\n");
  const count=Number(table[1].split(" ")[1]);
  assert.equal(count,6+50*2);
  for(let id=1;id<count;id++) {
    const offset=Number(table[id+2].slice(0,10));
    assert.ok(Number.isSafeInteger(offset));
    assert.equal(pdf.slice(offset,offset+String(id).length+6),id+" 0 obj", "object "+id+" offset");
  }
});
test("all six art directions produce a PDF without changing calculated data",()=>{
  const one=fixture();
  for(const style of REPORT_STYLES) {
    const d=createReportPdf({...one,style:style.id});
    assert.equal(d.pageCount,50);
    assert.equal(d.document.chart,one.chart);
    assert.match(Buffer.from(d.bytes).toString("utf8"),/\/Type \/Catalog/);
  }
});
test("unknown types and styles cannot silently select a substitute",()=>{
  assert.throws(()=>buildReportPages({...fixture(),type:"medical-diagnosis"}),/supported/);
  assert.throws(()=>buildReportPages({...fixture(),style:"other"}),/supported/);
});
