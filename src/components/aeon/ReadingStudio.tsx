// @ts-nocheck
import { useMemo, useState } from "react";
import { Astro } from "@/lib/aeon/astro.js";
import { UI } from "@/lib/aeon/visuals.js";
import { REPORT_TYPES, REPORT_STYLES, createReportPdf, buildReportPages } from "@/lib/aeon/report-studio.js";
import { Svg } from "./bits";

export function ReadingStudio({ owner, chart, person, houseSystem, onEditProfile }) {
  const [type,setType]=useState("blueprint");
  const [style,setStyle]=useState("luxe");
  const [consent,setConsent]=useState(false);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const selected=REPORT_STYLES.find(x=>x.id===style)||REPORT_STYLES[0];
  const other=person && !person.sample ? person : null;
  const partnerChart=useMemo(()=>other ? Astro.chart(other,houseSystem) : null,[other,houseSystem]);
  const aspects=useMemo(()=>Astro.aspects(chart.bodies,chart.bodies,6,true),[chart]);
  const crossAspects=useMemo(()=>partnerChart?Astro.aspects(chart.bodies,partnerChart.bodies,4):[],[chart,partnerChart]);
  const currentType=REPORT_TYPES.find(x=>x.id===type);
  const preview=useMemo(()=>{
    if(type==="synastry"&&(!other||!consent))return null;
    try {return buildReportPages({profile:owner,chart,type,style,aspects,partner:other,partnerChart,crossAspects,consent}).pages;}
    catch{return null;}
  },[owner,chart,type,style,aspects,other,partnerChart,crossAspects,consent]);
  async function generate() {
    setError("");setNotice("");setBusy(true);
    try{
      // Yield to the browser so it can paint the busy state before creating the document.
      await new Promise(resolve=>setTimeout(resolve,0));
      const timeline=[];
      if(type==="year"){
        const now=new Date();
        for(let i=0;i<12;i++){
          const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+i,15,12));
          const key=d.toISOString().slice(0,10);
          const zone=owner.place.zone;
          const sky=Astro.daily(chart,key,zone);
          timeline.push({month:new Intl.DateTimeFormat("en-AU",{month:"long",year:"numeric",timeZone:"UTC"}).format(d),events:sky.chosen});
        }
      }
      const result=createReportPdf({profile:owner,chart,type,style,aspects,partner:other,partnerChart,crossAspects,consent,timeline});
      const blob=new Blob([result.bytes],{type:"application/pdf"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=result.filename;document.body.appendChild(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),15000);
      setNotice("Created "+result.pageCount+" illustrated pages, privately in your browser. Your PDF download should begin.");
    }catch(e){setError(e instanceof Error?e.message:"Report creation failed.");}
    finally{setBusy(false);}
  }
  return (
    <div className="aeon-studio">
      <div className="page-heading">
        <div>
          <div className="eyebrow">AEON / ILLUSTRATED READING STUDIO</div>
          <h1>Make your sky a story.</h1>
          <p className="intro">Beautifully illustrated, grounded in calculated placements, and explained in everyday words. Every report is private to this browser.</p>
        </div>
        <button type="button" className="button secondary" onClick={onEditProfile}>Edit birth details</button>
      </div>
      <div className="studio-layout">
        <div className="studio-controls">
          <section className="panel">
            <div className="eyebrow">01 / CHOOSE A READING</div>
            <h2>What would you like to explore?</h2>
            <div className="studio-options" role="radiogroup" aria-label="Reading category">
              {REPORT_TYPES.map(x=><button key={x.id} type="button" role="radio" aria-checked={type===x.id} className={"studio-choice"+(type===x.id?" selected":"")} onClick={()=>{setType(x.id);setError("");setNotice("");}}>
                <strong>{x.label}</strong><span>{x.intro}</span>
              </button>)}
            </div>
          </section>
          <section className="panel">
            <div className="eyebrow">02 / CHOOSE A DESIGN</div><h2>Six ways to see the same sky.</h2>
            <div className="studio-themes" role="radiogroup" aria-label="Illustration style">
              {REPORT_STYLES.map(x=><button key={x.id} type="button" role="radio" aria-checked={style===x.id} className={"studio-style"+(style===x.id?" selected":"")} onClick={()=>{setStyle(x.id);setNotice("");}}>
                <span className="studio-swatch" style={{background:x.colors[0],color:x.colors[1],borderColor:x.colors[1]}} aria-hidden="true">{x.symbol}</span>
                <span>{x.label}</span>
              </button>)}
            </div>
          </section>
          {type==="synastry"&&<section className="panel">
            <div className="eyebrow">03 / PERMISSION</div><h2>Two skies, shared by choice.</h2>
            {other?<><p>The comparison uses <strong>{owner.name}</strong> and <strong>{other.name}</strong>, saved on this device.</p>
              <label className="studio-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I have the other person's permission to use their birth details for this report.</label></>:
              <p>Add a non-sample chart under Connections before creating a two-person report. The fictional demo chart cannot be used as a real partner.</p>}
          </section>}
          <div className="studio-actions">
            <button type="button" className="button studio-generate" onClick={generate} disabled={busy||(type==="synastry"&&(!other||!consent))}>
              {busy?"Designing your dossier…":"Generate & download PDF"}
            </button>
            <p className="calculation-note">Reports include measured astronomical positions and traditional interpretations. Not medical advice or predictions. The PDF stays on your device unless you share it.</p>
            {error&&<p role="alert" className="notice">{error}</p>}
            {notice&&<p role="status" className="notice neutral">{notice}</p>}
          </div>
        </div>
        <aside className="studio-preview">
          <div className="studio-preview-paper" style={{background:selected.colors[0],color:selected.colors[2]}}>
            <div className="studio-preview-kicker" style={{color:selected.colors[1]}}>A E O N  /  PRIVATE EDITION</div>
            <div className="studio-preview-orbit" style={{color:selected.colors[1],borderColor:selected.colors[1]}} aria-hidden="true"><div className="studio-preview-inner" style={{borderColor:selected.colors[1]}}>{selected.symbol}</div></div>
            <div className="studio-preview-bottom"><span style={{color:selected.colors[1]}}>ILLUSTRATED PERSONAL DOSSIER</span><h2>{currentType?.label}</h2><p>Prepared for {owner.name}</p></div>
          </div>
          <div className="studio-preview-meta">
            <strong>{selected.label}</strong>
            <span>{preview?preview.length+" pages in the current edition":"Complete the partner and consent details to preview"}</span>
            <span>10 planet chapters · 12 houses · chart diagrams · practical reflection</span>
            <span className="muted">Planetary positions never change when you change the design.</span>
          </div>
          <div className="panel studio-chart-thumbnail"><span className="eyebrow">YOUR CALCULATED NATAL WHEEL</span><Svg html={UI.wheel(chart)}/><p className="calculation-note">{chart.precision==="unknown"?"Birth time unknown: rising and houses are withheld.":"The same verified chart powers each design."}</p></div>
        </aside>
      </div>
    </div>
  );
}
