'use server';
// Compatibility entry points: deterministic coaching only. No model or API calls.
import { getUserProfile } from './user.actions';
import { getTodaysMeals } from './diet.actions';
import { getTodaysWater } from './water.actions';
import { getUserTimezone } from '@/lib/timezone';
import { prisma } from '@/lib/prisma';
import { buildCoach, type CoachInput } from '@/lib/coach';
import { lookupNutrition } from './nutrition.actions';
export async function getCoachData():Promise<CoachInput> {
  const user=await getUserProfile();
  if(!user)throw new Error('Unauthorized');
  const timezone=await getUserTimezone();
  const since=new Date(Date.now()-90*86400000);
  const [workouts,meals,weights,water]=await Promise.all([
    prisma.workoutLog.findMany({where:{userId:user.id,date:{gte:since}},include:{exercises:true},orderBy:{date:'desc'}}),
    getTodaysMeals(timezone),
    prisma.progressLog.findMany({where:{userId:user.id,date:{gte:since},bodyFatPct:null},select:{date:true,weight:true},orderBy:{date:'asc'}}),
    getTodaysWater()
  ]);
  return { now:new Date().toISOString(),timezone,user:{id:user.id,goal:user.goal,weight:user.weight,targetWeight:user.targetWeight,targetCalories:user.targetCalories,targetProtein:user.targetProtein,targetCarbs:user.targetCarbs,targetFats:user.targetFats,dietPreference:user.dietPreference},workouts:workouts.map(w=>({name:w.name,date:w.date.toISOString(),exercises:w.exercises.map(e=>({name:e.name,weight:e.weight,reps:e.reps,sets:e.sets,setDetails:e.setDetails}))})),meals:meals.map(m=>({calories:m.calories,protein:m.protein,carbs:m.carbs,fats:m.fats,fiber:m.fiber})),weights:weights.map(w=>({...w,date:w.date.toISOString()})),waterMl:water.totalMl};
}
export async function getCoachAnalysis(_timezone?:string) {return buildCoach(await getCoachData());}
export async function askCoachQuestion(question:string,_contextText?:string) {
  const c=buildCoach(await getCoachData());
  const q=String(question).slice(0,300).toLowerCase();
  const answer=/pain|injur/.test(q)?'Pause painful exercises. Persistent, severe or worsening pain needs professional assessment.':/food|meal|protein|calor|diet/.test(q)?c.nutrition:/weight|progress/.test(q)?c.trend.message:/water|hydrat/.test(q)?c.water:/rest|recover|sleep/.test(q)?c.notes.join(' ')||'Follow the rest days in your programme and check in before training.':/train|workout|next|tomorrow/.test(q)?c.recommendation:'Choose Next workout, Progression, Nutrition or Recovery in your coach panel. The coach uses your logged data and does not provide open-ended chat.';
  return {answer};
}
export async function generateDailyMealPlan(_cal?:number,_pro?:number,_carb?:number,_fat?:number,_preference?:string) {
  const c=buildCoach(await getCoachData());
  if(c.remaining.calories<100)return [];
  const preference=(await getUserProfile())!.dietPreference;
  const protein=preference==='VEGAN'?'tofu':preference==='VEGETARIAN'?'paneer':'chicken breast';
  const names=preference==='KETO'?[protein,'cucumber']:[protein,'rice','dal'];
  const foods=await Promise.all(names.map(name=>lookupNutrition(name)));
  const total=foods.reduce((s,f)=>s+f.calories,0);
  const scale=Math.min(1,c.remaining.calories/Math.max(1,total));
  return foods.map(f=>({foodName:`${f.foodName} (${Math.round(scale*100)}% of ${f.quantity})`,calories:Math.round(f.calories*scale),protein:Math.round(f.protein*scale),carbs:Math.round(f.carbs*scale),fats:Math.round(f.fats*scale)}));
}
