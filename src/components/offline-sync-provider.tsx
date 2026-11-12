'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logMeal } from '@/actions/diet.actions';
import { logWorkout } from '@/actions/workout.actions';
import { pendingEntries, syncEntry, queueEntry, removeEntry, type QueueItem } from '@/lib/offline-queue';

export function OfflineSyncProvider({ userId }: { userId?: string }) {
  const router = useRouter();
  const busy = useRef(false);
  const [pending, setPending] = useState<QueueItem[]>([]);
  const [offline, setOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [legacy, setLegacy] = useState(false);

  useEffect(() => {
    const update = () => {
      setOffline(!navigator.onLine);
      try {
        setPending(userId ? pendingEntries(userId) : []);
        setLegacy(!!localStorage.getItem('apexfit-offline-queue'));
      } catch {
        setError('Device storage is unavailable. Enable it to keep drafts and unsynced entries.');
      }
    };
    update();
    const events = ['apexfit-queue', 'storage', 'offline', 'online'];
    events.forEach(event => window.addEventListener(event, update));
    return () => events.forEach(event => window.removeEventListener(event, update));
  }, [userId]);

  const sync = useCallback(async () => {
    if (!userId || !navigator.onLine || busy.current) return;
    busy.current = true;
    try {
      const entries = pendingEntries(userId);
      if (!entries.length) return;
      setSyncing(true);
      setError('');
      let changed = false;
      for (const item of entries) {
        try {
          await syncEntry(item, item.type === 'MEAL' ? logMeal : logWorkout);
          changed = true;
        } catch (e) {
          queueEntry({ ...item, error: e instanceof Error ? e.message : 'Please retry.' });
          setError('Some entries could not sync. They remain on this device.');
        }
      }
      if (changed) router.refresh();
    } catch {
      setError('Could not access saved entries. Check device storage and retry.');
    } finally {
      busy.current = false;
      setSyncing(false);
    }
  }, [userId, router]);

  useEffect(() => {
    void sync();
    const retry = () => { if (document.visibilityState === 'visible') void sync(); };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', retry);
    const timer = setInterval(retry, 30000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', retry);
    };
  }, [sync]);

  function download(older = false) {
    try {
      const data = older ? localStorage.getItem('apexfit-offline-queue') || '[]' : JSON.stringify(pendingEntries(userId!), null, 2);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = older ? 'apexfit-legacy-unsynced.json' : 'apexfit-unsynced.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('Could not download the entries. They remain on this device.'); }
  }

  if (!userId || (!pending.length && !offline && !legacy && !syncing && !error)) return null;
  return <aside aria-label="Save and sync status" className="border-b border-amber-400/30 bg-amber-400/10 p-3 text-sm">
    <p role="status">{offline ? 'Offline. Saved entries stay on this device.' : syncing ? 'Syncing your entries…' : pending.length + ' entries waiting to sync.'}</p>
    {error && <p>{error}</p>}
    {pending.length > 0 && <>
      {!offline && <button className="underline mr-3" disabled={syncing} onClick={() => void sync()}>Retry sync</button>}
      <button className="underline" onClick={() => download()}>Download pending entries</button>
      <details className="mt-2"><summary className="cursor-pointer">Review pending entries</summary><ul className="mt-2 space-y-2">
        {pending.map(item => <li key={item.id}>
          <span>{item.form.foodName || item.form.name || item.type}</span>
          {item.error && <span className="ml-2">{item.error}</span>}
          <button disabled={syncing} className="underline ml-3" onClick={() => {
            if (window.confirm('Remove this unsynced entry from this device? Download it first if you want to keep a copy.')) {
              try { removeEntry(item); } catch { setError('Could not remove the entry.'); }
            }
          }}>Remove from queue</button>
        </li>)}
      </ul></details>
    </>}
    {legacy && <p className="mt-1">Older unsynced entries have no account identifier and were preserved. <button className="underline" onClick={() => download(true)}>Download for review</button></p>}
  </aside>;
}
