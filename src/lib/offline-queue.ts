export type QueueItem = { id: string; userId: string; type: 'MEAL'|'WORKOUT'; form: Record<string,string>; createdAt: number; error?: string };
const PREFIX='apexfit-entry-v2:';
export function pendingEntries(userId:string):QueueItem[] {
  const result:QueueItem[]=[];
  for(let i=0;i<localStorage.length;i++) {
    const key=localStorage.key(i);
    if(!key?.startsWith(PREFIX+userId+':'))continue;
    try { const item=JSON.parse(localStorage.getItem(key)||'null');if(item?.userId===userId && typeof item.id==='string' && ['MEAL','WORKOUT'].includes(item.type) && item.form && typeof item.form==='object' && Object.values(item.form).every(v=>typeof v==='string'))result.push(item); } catch { /* Never overwrite unreadable data. */ }
  }
  return result.sort((a,b)=>a.createdAt-b.createdAt);
}
function key(item:QueueItem) { return PREFIX+item.userId+':'+item.id; }
export function queueEntry(item:QueueItem) {
  // Per-entry keys avoid read/modify/write races and do not silently drop old entries.
  localStorage.setItem(key(item),JSON.stringify(item));
  window.dispatchEvent(new Event('apexfit-queue'));
}
export function removeEntry(item:QueueItem) {localStorage.removeItem(key(item));window.dispatchEvent(new Event('apexfit-queue'));}
export async function syncEntry(item:QueueItem, send:(fd:FormData)=>Promise<unknown>) {
  const fd=new FormData();
  Object.entries(item.form).forEach(([k,v])=>fd.set(k,v));
  fd.set('clientId',item.id);fd.set('ownerId',item.userId);
  await send(fd);
  removeEntry(item);
}
export async function saveEntry(userId:string,type:QueueItem['type'],fd:FormData,send:(fd:FormData)=>Promise<unknown>) {
  const id=String(fd.get('clientId')||crypto.randomUUID());
  fd.set('clientId',id);fd.set('ownerId',userId);
  const item:QueueItem={id,userId,type,form:Object.fromEntries(fd) as Record<string,string>,createdAt:Date.now()};
  queueEntry(item); // If storage is full, stop visibly; never pretend a save succeeded.
  if(!navigator.onLine)return 'queued';
  try {await syncEntry(item,send);return 'synced';}
  catch(err) {queueEntry({...item,error:err instanceof Error?err.message:'Could not sync'});return 'queued';}
}
