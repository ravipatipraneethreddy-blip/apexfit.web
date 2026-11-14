import { getCoachData } from '@/actions/ai.actions';
import { CoachPanel } from './coach-panel';

export async function AICoachServer({ compact = false }: { compact?: boolean }) {
  try {
    const data = await getCoachData();
    return <CoachPanel key={data.user.id} data={data} compact={compact} />;
  } catch {
    return <div role="status" className="glass-panel rounded-2xl p-5 mb-6">Coaching data could not load. Refresh to retry; your saved entries have not changed.</div>;
  }
}
