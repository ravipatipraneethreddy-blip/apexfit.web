'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildCoach, DEFAULT_SETTINGS, normaliseSettings, type CoachInput, type CoachSettings, type Recovery } from '@/lib/coach';
import { dateKey } from '@/lib/dates';
import { generateDailyMealPlan } from '@/actions/ai.actions';
const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const inputClass='w-full bg-background border border-border rounded-lg p-2 text-sm mt-1';
export function CoachPanel({data}:{data:CoachInput}) {
  const router=useRouter(),key='apexfit-coach:'+data.user.id;
  const [settings,setSettings]=useState<CoachSettings>(DEFAULT_SETTINGS),[recovery,setRecovery]=useState<Recovery|undefined>();
  const [ready,setReady]=useState(false),[expanded,setExpanded]=useState(false),[error,setError]=useState('');
  const [form,setForm]=useState({sleep:7,fatigue:2,soreness:2,pain:false});
  const [ideas,setIdeas]=useState<Awaited<ReturnType<typeof generateDailyMealPlan>>>([]),[loading,setLoading]=useState(false);
  const [now,setNow]=useState(data.now);
  useEffect(()=>{setNow(data.now);},[data.now]);
  useEffect(()=>{
    let refreshedDay = dateKey(data.now,data.timezone);
    const tick=()=>{
      if(document.visibilityState!=='visible')return;
      const stamp=new Date().toISOString(),day=dateKey(stamp,data.timezone);
      setNow(stamp);
      if(navigator.onLine && day!==refreshedDay){refreshedDay=day;router.refresh();}
    };
    const visible=()=>{tick();if(document.visibilityState==='visible' && navigator.onLine && Date.now()-Date.parse(data.now)>60000)router.refresh();};
    const id=setInterval(tick,60000);document.addEventListener('visibilitychange',visible);
    return ()=>{clearInterval(id);document.removeEventListener('visibilitychange',visible);};
  },[router,data.now,data.timezone]);
  useEffect(()=>{try {const saved=localStorage.getItem(key);if(saved)setSettings(normaliseSettings(JSON.parse(saved)));const r=localStorage.getItem(key+':recovery');if(r){const restored=JSON.parse(r);setRecovery(restored);if(restored?.date===dateKey(data.now,data.timezone))setForm(restored);}}catch{setError('Saved coaching settings could not be read. Defaults are shown.');}setReady(true);},[key]);
  const c=useMemo(()=>buildCoach({...data,now},settings,recovery),[data,now,settings,recovery]);
  function change(next:Partial<CoachSettings>){const value=normaliseSettings({...settings,...next});setSettings(value);try{localStorage.setItem(key,JSON.stringify(value));setError('');}catch{setError('Settings could not be saved on this device.');}}
  function checkIn(){const r={...form,date:dateKey(now,data.timezone)};setRecovery(r);try{localStorage.setItem(key+':recovery',JSON.stringify(r));}catch{setError('Check-in could not be saved on this device.');}}
  function start(){try{localStorage.setItem('apexfit-coach-session:'+data.user.id,JSON.stringify({name:c.next?.session,exercises:c.prescription,date:c.next?.date}));router.push('/workout?template=Recommended');}catch{setError('Could not prepare the session. Please free device storage and retry.');}}
  return <section aria-labelledby="coach-title" className="glass-panel rounded-2xl p-5 md:p-6 mb-8 border border-primary/30">
    <div className="flex justify-between items-start gap-3"><div><p className="text-xs uppercase tracking-widest text-primary">Your personal coach</p><h2 id="coach-title" className="text-xl font-bold mt-1">{ready?c.next?`Next: ${c.next.session}`:'Recovery comes first':'Loading your programme…'}</h2><p className="text-sm text-muted-foreground mt-2">{c.insight}</p></div><button className="text-sm underline p-2" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>Plan settings</button></div>
    {error&&<p role="alert" className="text-amber-400 mt-3">{error}</p>}
    <p className="text-sm mt-3">{c.recommendation}</p>
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4">{c.plan.map(p=><div key={p.date} className={`rounded-xl border p-3 ${p.kind==='train'?'border-primary/30 bg-primary/5':'border-border'}`}><p className="text-xs text-muted-foreground">{new Date(p.date+'T12:00:00Z').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',timeZone:'UTC'})}</p><p className="text-sm font-semibold mt-1">{p.session}</p><p className="text-xs text-muted-foreground mt-2">{p.kind==='done'?'Completed':p.kind==='rest'?p.reason:'Planned'}</p></div>)}</div>
    <p className="text-xs text-muted-foreground mt-2">Future sessions are provisional. Recheck recovery on the day. Skipped days never create catch-up doubles.</p>
    {expanded&&<div className="grid sm:grid-cols-2 gap-4 mt-5 border-t border-border pt-4">
      <label className="text-sm">Programme<select className={inputClass} value={settings.split} onChange={e=>change({split:e.target.value as CoachSettings['split']})}><option value="PPL">Push / Pull / Legs</option><option value="UPPER_LOWER">Upper / Lower</option><option value="FULL_BODY">Full Body</option></select></label>
      <label className="text-sm">Experience<select className={inputClass} value={settings.experience} onChange={e=>change({experience:e.target.value as CoachSettings['experience']})}><option value="BEGINNER">Beginner</option><option value="EXPERIENCED">Experienced</option></select></label>
      <fieldset className="sm:col-span-2"><legend className="text-sm mb-2">Available training days</legend><div className="flex flex-wrap gap-2">{days.map((d,i)=><button key={d} aria-pressed={settings.trainingDays.includes(i)} onClick={()=>change({trainingDays:settings.trainingDays.includes(i)?settings.trainingDays.filter(x=>x!==i):[...settings.trainingDays,i]})} className={`rounded-lg px-3 py-2 text-sm ${settings.trainingDays.includes(i)?'bg-primary text-primary-foreground':'bg-secondary'}`}>{d}</button>)}</div></fieldset>
      <label className="text-sm">Equipment<select className={inputClass} value={settings.equipment} onChange={e=>change({equipment:e.target.value as CoachSettings['equipment']})}><option value="GYM">Gym</option><option value="DUMBBELLS">Dumbbells</option><option value="BODYWEIGHT">Bodyweight, no equipment</option></select></label>
      <label className="text-sm">Session length<select className={inputClass} value={settings.sessionMinutes} onChange={e=>change({sessionMinutes:Number(e.target.value)})}>{[20,30,45,60,90].map(n=><option key={n} value={n}>{n} minutes</option>)}</select></label>
      <label className="text-sm">Lower rep target<input className={inputClass} type="number" min="3" max="20" value={settings.repMin} onChange={e=>change({repMin:Number(e.target.value)})}/></label>
      <label className="text-sm">Upper rep target<input className={inputClass} type="number" min={settings.repMin} max="30" value={settings.repMax} onChange={e=>change({repMax:Number(e.target.value)})}/></label>
      <label className="text-sm">Smallest load increase (kg)<input className={inputClass} type="number" min="0.25" max="10" step="0.25" value={settings.increment} onChange={e=>change({increment:Number(e.target.value)})}/></label>
      <p className="text-xs text-muted-foreground self-end">Plan settings and recovery check-ins are saved for your account on this browser. Workout history is saved to your account.</p>
    </div>}
    <details className="mt-5 border-t border-border pt-4"><summary className="font-semibold cursor-pointer">Daily recovery check-in {recovery?.date===c.today?'✓':''}</summary><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3"><label className="text-sm">Sleep (hours)<input className={inputClass} type="number" min="0" max="14" step="0.5" value={form.sleep} onChange={e=>setForm({...form,sleep:Math.max(0,Math.min(14,Number(e.target.value)))})}/></label>{(['fatigue','soreness'] as const).map(field=><label key={field} className="text-sm capitalize">{field}<select className={inputClass} value={form[field]} onChange={e=>setForm({...form,[field]:Number(e.target.value)})}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} — {n===1?'Low':n===5?'Very high':n===4?'High':'Moderate'}</option>)}</select></label>)}</div><label className="text-sm flex gap-2 mt-3"><input type="checkbox" checked={form.pain} onChange={e=>setForm({...form,pain:e.target.checked})}/>I have pain or a current injury affecting training</label><button className="rounded-lg bg-primary text-primary-foreground px-4 py-2 mt-3 text-sm" onClick={checkIn}>Save check-in</button></details>
    {c.notes.length>0&&<ul className="mt-4 space-y-2 text-sm text-amber-300">{c.notes.map(n=><li key={n}>{n}</li>)}</ul>}
    <details className="mt-5" open><summary className="font-semibold cursor-pointer">Next-session exercises and progression</summary><div className="space-y-3 mt-3">{c.prescription.map(e=><div key={e.name} className="rounded-xl bg-background/60 p-3"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm">{e.name}</strong><span className="text-sm text-primary">{e.sets} × {e.reps}–{settings.repMax} reps · {e.weight>0?`${e.weight} kg`:'choose resistance'}</span></div><p className="text-xs text-muted-foreground mt-1">{e.reason}</p></div>)}</div><p className="text-xs text-muted-foreground mt-3">Warm up first. Rest roughly 2 minutes between working sets, longer if needed. Load suggestions are optional; prioritise controlled technique.</p>{c.next&&<button disabled={!ready||recovery?.date===c.today&&recovery.pain} onClick={start} className="rounded-xl bg-primary text-primary-foreground px-4 py-3 mt-3 disabled:opacity-50">Open recommended session</button>}</details>
    <div className="grid sm:grid-cols-2 gap-4 mt-6 border-t border-border pt-4"><div><h3 className="font-semibold">Nutrition today</h3><p className="text-sm text-muted-foreground mt-2">{c.nutrition}</p><p className="text-sm text-muted-foreground mt-2">{c.water}</p><button className="underline text-sm mt-3" disabled={loading} onClick={async()=>{setLoading(true);try{setIdeas(await generateDailyMealPlan());}catch{setError('Food suggestions could not load.');}finally{setLoading(false);}}}>{loading?'Loading…':'Suggest foods from the database'}</button>{ideas.map((m,i)=><p key={i} className="text-xs mt-2">{m.foodName}: approximately {m.calories} kcal, {m.protein} g protein.</p>)}{ideas.length>0&&<p className="text-xs text-muted-foreground mt-2">Ideas only, not a complete diet plan or allergy check. Check ingredients and portions; nothing is logged automatically.</p>}</div><div><h3 className="font-semibold">Weight trend</h3><p className="text-sm text-muted-foreground mt-2">{c.trend.message}</p><p className="text-xs text-muted-foreground mt-3">Recommendations use your logs and coaching rules. No language model or LLM API is used.</p></div></div>
  </section>;
}
