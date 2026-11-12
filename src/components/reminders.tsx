'use client';
import { useEffect, useState } from 'react';
import { useToast } from './toast';
import { dateKey } from '@/lib/dates';
const storageKey=(id:string)=>'apexfit-reminder:'+id;
export function ReminderRunner({userId}:{userId?:string}) {
  const {toast}=useToast();
  useEffect(()=>{
    if(!userId)return;
    const check=()=>{
      try {
        const config=JSON.parse(localStorage.getItem(storageKey(userId))||'null');
        if(!config?.enabled)return;
        const now=new Date(),zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
        const key=storageKey(userId)+':'+dateKey(now,zone);
        const [h,m]=String(config.time||'20:00').split(':').map(Number);
        const minutes=now.getHours()*60+now.getMinutes(),target=h*60+m;
        if(minutes<target||minutes>target+60||localStorage.getItem(key))return;
        localStorage.setItem(key,'shown');
        toast('Daily check-in: review your meals, recovery and next training session.', 'info');
        if('Notification' in window && Notification.permission==='granted') {
          navigator.serviceWorker?.getRegistration().then(reg=>reg?.showNotification('ApexFit daily check-in',{body:'Review your meals, recovery and next session.',icon:'/icons/icon-192.png',tag:'apexfit-daily'})).catch(()=>{});
        }
      } catch { /* A bad setting must not crash the app. */ }
    };
    const interval=setInterval(check,30000);check();
    return ()=>clearInterval(interval);
  },[userId,toast]);
  return null;
}
export function ReminderSettings({userId}:{userId:string}) {
  const [enabled,setEnabled]=useState(false),[time,setTime]=useState('20:00'),[message,setMessage]=useState('');
  useEffect(()=>{try{const c=JSON.parse(localStorage.getItem(storageKey(userId))||'null');if(c){setEnabled(!!c.enabled);setTime(c.time||'20:00');}}catch{}},[userId]);
  function validTime(){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)){setMessage('Choose a valid reminder time.');return false;}return true;}
  function save(next:boolean){if(!validTime())return;try{localStorage.setItem(storageKey(userId),JSON.stringify({enabled:next,time}));setEnabled(next);setMessage(next?'Reminder saved for this browser. Keep ApexFit open to receive it.':'Reminders disabled.');}catch{setMessage('Could not save reminder settings.');}}
  function calendar(){if(!validTime())return;const now=new Date();const [h,m]=time.split(':').map(Number);now.setHours(h,m,0,0);if(now.getTime()<Date.now())now.setDate(now.getDate()+1);const pad=(n:number)=>String(n).padStart(2,'0');const dt=`${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}T${pad(h)}${pad(m)}00`;const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//ApexFit//Daily Check In//EN','BEGIN:VEVENT',`UID:${crypto.randomUUID()}@apexfit`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART:${dt}`,'DURATION:PT5M','RRULE:FREQ=DAILY','SUMMARY:ApexFit daily check-in','DESCRIPTION:Review meals and recovery. Open ApexFit for your next session.','BEGIN:VALARM','TRIGGER:PT0M','ACTION:DISPLAY','DESCRIPTION:ApexFit daily check-in','END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));const a=document.createElement('a');a.href=url;a.download='apexfit-daily-reminder.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Import the downloaded file into your calendar and enable its notifications.');}
  return <section className="glass-panel rounded-2xl p-4 mb-6"><h3 className="font-semibold">Daily reminders</h3><p className="text-xs text-muted-foreground mt-2">In-app reminders work while ApexFit is open. For reminders when it is closed, add a calendar reminder.</p><label className="block text-sm mt-3">Local reminder time<input type="time" value={time} onChange={e=>setTime(e.target.value)} className="block bg-background border border-border p-2 rounded-lg mt-1"/></label><div className="flex flex-wrap gap-2 mt-3"><button className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm" onClick={()=>save(!enabled)}>{enabled?'Disable in-app reminder':'Enable in-app reminder'}</button>{enabled&&<button className="underline text-sm" onClick={()=>save(true)}>Save time</button>}<button className="underline text-sm" onClick={calendar}>Add to calendar</button></div><p role="status" className="text-xs mt-2">{message}</p></section>;
}
