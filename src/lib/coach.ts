import { dateKey, shiftDate, dayDistance } from './dates';
export type Split = 'PPL' | 'UPPER_LOWER' | 'FULL_BODY';
export type CoachSettings = { split: Split; trainingDays: number[]; repMin: number; repMax: number; increment: number; sessionMinutes: number; equipment: 'GYM' | 'DUMBBELLS' | 'BODYWEIGHT'; experience: 'BEGINNER' | 'EXPERIENCED' };
export type Recovery = { date: string; sleep: number; fatigue: number; soreness: number; pain: boolean };
export type CoachExercise = { name: string; weight: number; reps: number; sets: number; setDetails?: unknown };
export type CoachWorkout = { date: string; name: string; exercises: CoachExercise[] };
export type CoachInput = { now: string; timezone: string; user: { id: string; goal: string; weight: number; targetWeight: number | null; targetCalories: number | null; targetProtein: number | null; targetCarbs: number | null; targetFats: number | null; dietPreference: string }; workouts: CoachWorkout[]; meals: { calories: number; protein: number; carbs: number; fats: number; fiber: number }[]; weights: { date: string; weight: number }[]; waterMl: number };
export const DEFAULT_SETTINGS: CoachSettings = { split: 'PPL', trainingDays: [1, 3, 5], repMin: 8, repMax: 12, increment: 2.5, sessionMinutes: 45, equipment: 'GYM', experience: 'BEGINNER' };
export function normaliseSettings(raw: Partial<CoachSettings>): CoachSettings {
  if (!raw || typeof raw !== 'object') raw = {};
  const clamp = (n: unknown, low: number, high: number, fallback: number) => typeof n === 'number' && Number.isFinite(n) ? Math.max(low, Math.min(high, n)) : fallback;
  const days = Array.isArray(raw.trainingDays) ? [...new Set(raw.trainingDays.filter(d => Number.isInteger(d) && d >= 0 && d <= 6))].sort() : DEFAULT_SETTINGS.trainingDays;
  const min = Math.round(clamp(raw.repMin, 3, 20, 8));
  return { split: ['PPL', 'UPPER_LOWER', 'FULL_BODY'].includes(raw.split || '') ? raw.split! : 'PPL', trainingDays: days.length ? days : [1,3,5], repMin: min, repMax: Math.round(clamp(raw.repMax, min, 30, Math.max(12,min))), increment: clamp(raw.increment, 0.25, 10, 2.5), sessionMinutes: clamp(raw.sessionMinutes, 20, 120, 45), equipment: ['GYM','DUMBBELLS','BODYWEIGHT'].includes(raw.equipment || '') ? raw.equipment! : 'GYM', experience: raw.experience === 'EXPERIENCED' ? raw.experience : 'BEGINNER' };
}
const sequences = { PPL: ['Push Day', 'Pull Day', 'Leg Day'], UPPER_LOWER: ['Upper Body', 'Lower Body'], FULL_BODY: ['Full Body'] };
export function classifyWorkout(name: string): string | null {
  const n = name.toLowerCase();
  if (/full[ -]?body/.test(n)) return 'Full Body';
  if (/upper/.test(n)) return 'Upper Body';
  if (/lower/.test(n)) return 'Lower Body';
  if (/push|chest/.test(n)) return 'Push Day';
  if (/pull|back/.test(n)) return 'Pull Day';
  if (/leg/.test(n)) return 'Leg Day';
  return null;
}
const exercises: Record<string, Record<string,string[]>> = {
 GYM: { 'Push Day': ['Barbell Bench Press','Incline Dumbbell Press','Overhead Press','Lateral Raises','Tricep Pushdown'], 'Pull Day': ['Lat Pulldown','Seated Cable Row','Face Pulls','Barbell Curl','Hammer Curls'], 'Leg Day': ['Barbell Squats','Romanian Deadlift','Leg Curls','Calf Raises'], 'Upper Body': ['Barbell Bench Press','Seated Cable Row','Overhead Press','Lat Pulldown','Barbell Curl'], 'Lower Body': ['Barbell Squats','Romanian Deadlift','Leg Curls','Calf Raises'], 'Full Body': ['Barbell Squats','Barbell Bench Press','Seated Cable Row','Romanian Deadlift'] },
 DUMBBELLS: { 'Push Day': ['Dumbbell Floor Press','Dumbbell Shoulder Press','Lateral Raises','Dumbbell Tricep Extension'], 'Pull Day': ['One Arm Dumbbell Row','Dumbbell Reverse Fly','Dumbbell Curl','Hammer Curls'], 'Leg Day': ['Goblet Squat','Dumbbell Romanian Deadlift','Reverse Lunge','Calf Raises'], 'Upper Body': ['Dumbbell Floor Press','One Arm Dumbbell Row','Dumbbell Shoulder Press','Dumbbell Curl'], 'Lower Body': ['Goblet Squat','Dumbbell Romanian Deadlift','Reverse Lunge','Calf Raises'], 'Full Body': ['Goblet Squat','Dumbbell Floor Press','One Arm Dumbbell Row','Dumbbell Romanian Deadlift'] },
 BODYWEIGHT: { 'Push Day': ['Push Ups','Incline Push Ups','Pike Push Ups'], 'Pull Day': ['Prone Y Raises','Prone T Raises','Reverse Snow Angels'], 'Leg Day': ['Bodyweight Squat','Reverse Lunge','Glute Bridge','Calf Raises'], 'Upper Body': ['Push Ups','Prone Y Raises','Pike Push Ups','Reverse Snow Angels'], 'Lower Body': ['Bodyweight Squat','Reverse Lunge','Glute Bridge','Calf Raises'], 'Full Body': ['Bodyweight Squat','Push Ups','Glute Bridge','Prone Y Raises'] }
};
export function setDetails(ex: CoachExercise): {weight:number;reps:number}[] {
  if (Array.isArray(ex.setDetails)) return ex.setDetails.filter(s => s && Number.isFinite(s.weight) && Number.isFinite(s.reps) && s.reps > 0);
  return Array.from({length: Math.min(50, Math.max(0,ex.sets))}, () => ({weight:ex.weight,reps:ex.reps}));
}
function norm(name: string) { return name.toLowerCase().replace(/\b(squats|curls|raises|pushdowns|pulldowns)\b/g, word => word.slice(0,-1)).replace(/[^a-z0-9]/g,''); }
export function progression(name: string, workouts: CoachWorkout[], settings: CoachSettings, ease: boolean, now: string) {
  const history = [...workouts].filter(w => Date.parse(w.date) <= Date.parse(now)).sort((a,b) => Date.parse(b.date)-Date.parse(a.date)).flatMap(w => w.exercises.filter(e => norm(e.name) === norm(name)).map(e => ({ ...e, date: w.date })));
  const latest = history[0];
  const base = { name, sets: settings.experience === 'BEGINNER' ? 2 : 3, reps: settings.repMin, weight: 0, restSeconds: 120, reason: 'No previous entry. Choose a manageable starting resistance; finish with 2–3 reps in reserve.' };
  if (!latest) return ease ? {...base, sets:Math.max(1,base.sets-1),reason:'Recovery is below your usual level. Start with fewer easy sets and reassess before adding resistance.'} : base;
  const details = setDetails(latest);
  const weight = settings.equipment === 'BODYWEIGHT' ? 0 : details.length ? Math.max(...details.map(s=>s.weight)) : 0;
  const plannedSets = base.sets;
  const atSameLoad = details.filter(s=>s.weight === weight);
  const targetMet = details.length >= plannedSets && atSameLoad.length === details.length && details.every(s=>s.reps >= settings.repMax);
  const recent = history.slice(0,3);
  const belowRange = recent.length >= 2 && recent.slice(0,2).every(e => {const sets=setDetails(e);return sets.length>0 && sets.every(s=>s.reps < settings.repMin);});
  if (ease || (Date.parse(now) - Date.parse(latest.date)) > 14*86400000 || belowRange) return {...base, sets: Math.max(1,base.sets-1), weight: Math.max(0,Math.round(weight*0.9*100)/100), reason: 'Use an easier session: fewer sets and about 10% less load, rounded to equipment you have. Reassess technique and recovery.'};
  if (targetMet && weight > 0) {
    if (settings.increment > weight * 0.1) return {...base, weight, reps:settings.repMax, reason:'Top of your rep range reached. Keep this load until a smaller increment is available (no more than 10%).'};
    return {...base, weight:Math.round((weight+settings.increment)*100)/100, reason:`All ${details.length} sets reached ${settings.repMax} reps at the same load. If form was controlled and reps remained in reserve, try +${settings.increment} kg; otherwise repeat.`};
  }
  const reps = Math.min(settings.repMax,Math.max(settings.repMin,(details.length?Math.min(...details.map(s=>s.reps)):settings.repMin)+1));
  return {...base,weight,reps,reason:weight === 0 ? 'Use the same variation. Add controlled reps before choosing a harder variation.' : 'Repeat the load and build reps within your range. Mixed-load sets do not trigger a weight increase.'};
}
export function weightTrend(weights: CoachInput['weights'], today: string, timezone: string) {
  const daily = new Map<string,number>();
  for (const w of [...weights].sort((a,b)=>a.date.localeCompare(b.date))) {const k=dateKey(w.date,timezone);if(k<=today && Number.isFinite(w.weight))daily.set(k,w.weight);}
  const recent=[...daily].filter(([d])=>dayDistance(today,d)>=0 && dayDistance(today,d)<7).map(([,w])=>w);
  const prior=[...daily].filter(([d])=>dayDistance(today,d)>=7 && dayDistance(today,d)<14).map(([,w])=>w);
  const average=(a:number[])=>a.reduce((s,n)=>s+n,0)/a.length;
  if(recent.length<3)return {message:'Log weight on at least 3 separate days in each week to compare weekly averages.',average:null,change:null};
  if(prior.length<3)return {message:`7-day average: ${average(recent).toFixed(1)} kg across ${recent.length} recorded days. More readings from the previous week are needed for a comparison.`,average:Math.round(average(recent)*10)/10,change:null};
  const avg=average(recent), change=avg-average(prior);
  return {average:Math.round(avg*10)/10,change:Math.round(change*100)/100,message:`7-day average: ${avg.toFixed(1)} kg (${change>=0?'+':''}${change.toFixed(2)} kg versus the previous week). Daily water changes can hide progress; use the trend.`};
}
export function buildCoach(input: CoachInput, rawSettings: Partial<CoachSettings> = {}, checkIn?: Recovery) {
  const settings=normaliseSettings(rawSettings), today=dateKey(input.now,input.timezone);
  const workouts=input.workouts.filter(w=>Date.parse(w.date)<=Date.parse(input.now)).sort((a,b)=>b.date.localeCompare(a.date));
  const sequence=sequences[settings.split];
  const matching=workouts.find(w=>sequence.includes(classifyWorkout(w.name)||''));
  let nextIndex=matching?(sequence.indexOf(classifyWorkout(matching.name)!)+1)%sequence.length:0;
  const checked=checkIn?.date===today ? checkIn : undefined;
  const pain=checked?.pain===true;
  const ease=!!checked && (checked.sleep<6 || checked.fatigue>=4 || checked.soreness>=4);
  const last=workouts[0];
  const trainedToday=!!last && dateKey(last.date,input.timezone)===today;
  const plan: {date:string;session:string;reason:string;kind:'train'|'rest'|'done'}[]=[];
  let lastDate=last?dateKey(last.date,input.timezone):'';
  let lastKind=last?classifyWorkout(last.name):null;
  let consecutive=0;
  for(let i=1;i<=3;i++)if(workouts.some(w=>dateKey(w.date,input.timezone)===shiftDate(today,-i)))consecutive++;else break;
  // Look beyond the visible week so a once-weekly trainee still has a next session.
  for(let i=0;i<14;i++) {
    const day=shiftDate(today,i),weekday=new Date(day+'T12:00:00Z').getUTCDay(), next=sequence[nextIndex];
    let reason='',kind:'train'|'rest'|'done'='train',session=next;
    if(i===0 && trainedToday){kind='done';session=last.name;consecutive++;reason='Completed today. Your next session follows the programme sequence.';}
    else if(i===0 && pain){kind='rest';session='Recovery';reason='Pain reported. Pause painful training; seek assessment for persistent or worsening pain.';}
    else if(!settings.trainingDays.includes(weekday)){kind='rest';session='Rest';reason='Scheduled rest day. Missed sessions are not doubled up.';}
    else if(i===0 && checked && (checked.fatigue>=5 || checked.soreness>=5)){kind='rest';session='Recovery';reason='Your check-in indicates very high fatigue or soreness. Reassess before training.';}
    else if(consecutive>=3 || (lastDate && dayDistance(day,lastDate)<2 && (lastKind===next || next==='Full Body' || lastKind==='Full Body'))){kind='rest';session='Rest';reason='Allow recovery before repeating the same muscle groups.';}
    else {reason=matching?'Continue after your last completed session; missed days do not skip the sequence.':'Starting your selected programme. Rename custom sessions to match the split if you want them to advance it.';nextIndex=(nextIndex+1)%sequence.length;lastDate=day;lastKind=next;consecutive++;}
    if(kind==='rest')consecutive=0;
    plan.push({date:day,session,reason,kind});
  }
  const next=plan.find(p=>p.kind==='train');
  const session=next?.session || sequence[nextIndex];
  const names=exercises[settings.equipment][session] || [];
  const count=settings.sessionMinutes<=30?3:settings.sessionMinutes<=45?4:6;
  const prescription=names.slice(0,count).map(name=>progression(name,workouts,settings,ease,input.now));
  const totals=input.meals.reduce((s,m)=>({calories:s.calories+m.calories,protein:s.protein+m.protein,carbs:s.carbs+m.carbs,fats:s.fats+m.fats,fiber:s.fiber+m.fiber}),{calories:0,protein:0,carbs:0,fats:0,fiber:0});
  const remaining={calories:Math.max(0,Math.round((input.user.targetCalories||2000)-totals.calories)),protein:Math.max(0,Math.round((input.user.targetProtein||input.user.weight*2)-totals.protein)),carbs:Math.max(0,Math.round((input.user.targetCarbs||0)-totals.carbs)),fats:Math.max(0,Math.round((input.user.targetFats||0)-totals.fats))};
  const nutrition=input.meals.length===0?'No meals logged today. Log your intake before judging adherence.':`${Math.round(totals.calories)} kcal and ${Math.round(totals.protein)} g protein logged. ${remaining.calories} kcal and ${remaining.protein} g protein remain against your saved targets. This is logged intake, not a complete-day assessment.`;
  const trend=weightTrend(input.weights,today,input.timezone);
  const notes=[] as string[];
  if(!checked)notes.push('Recovery has not been checked today. Recommendations assume you feel ready; add your check-in below.');
  if(ease)notes.push('Low sleep or elevated fatigue/soreness: keep the next session lighter and reassess before starting.');
  if(pain)notes.push('Do not train through pain. Future sessions are provisional until you feel ready.');
  if(settings.equipment==='BODYWEIGHT')notes.push('Equipment-free pulling options are limited. A suitable row or pull-up setup is needed for progressive pulling resistance.');
  if(settings.trainingDays.length<=3 && settings.split==='PPL')notes.push('PPL on three days usually trains each group once weekly. Full Body is an alternative if you want more frequent practice.');
  if(last && !classifyWorkout(last.name))notes.push('Your latest custom workout cannot be classified. Choose a matching session name or select the correct programme.');
  if(trend.change!==null && Math.abs(trend.change)>input.user.weight*0.01)notes.push('Your weekly weight trend changed quickly. Check consistent weigh-ins, recovery and food logging before changing targets.');
  if(remaining.calories===0 && totals.calories>0)notes.push('Calorie target reached. Do not compensate with punishment exercise or by skipping tomorrow’s meals.');
  return {settings,today,plan:plan.slice(0,7),next,prescription,totals,remaining,nutrition,trend,notes,adherence:input.meals.length?'Based on logged intake':'Awaiting food logs',insight:last?`Latest workout: ${last.name} on ${dateKey(last.date,input.timezone)}.`:'No workouts logged yet. Choose a programme and start at a manageable level.',recommendation:next?`${next.session} on ${next.date}. ${next.reason}`:'Prioritise recovery and review your training days.',water:`${(input.waterMl/1000).toFixed(1)} L water logged today. Use your own hydration target; needs vary with heat and activity.`};
}
