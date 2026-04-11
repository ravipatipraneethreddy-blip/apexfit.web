"use server";

import { getUserProfile } from "./user.actions";
import { getTodaysMeals } from "./diet.actions";
import { getRecentWorkouts } from "./workout.actions";

export async function getCoachAnalysis(timezone: string = "Asia/Kolkata") {
  const defaultRes = { adherence: "Pending", insight: "Please complete the onboarding to get personalized AI coaching.", recommendation: "Log some meals!" };
  const user = await getUserProfile();
  if (!user) return defaultRes;

  const apiKey = process.env.OPENAI_API_KEY;
  const noApiKey = !apiKey || apiKey === "your-openai-api-key-here";

  const meals = await getTodaysMeals(timezone);
  const workouts = await getRecentWorkouts();

  const totalCals = meals.reduce((acc: number, meal: any) => acc + meal.calories, 0);
  const totalProtein = meals.reduce((acc: number, meal: any) => acc + meal.protein, 0);

  if (noApiKey) {
    return {
      adherence: totalCals > (user.targetCalories || 2000) ? "Over Calorie Target" : "On Track",
      insight: `Today: ${totalCals} kcal across ${meals.length} meals (${totalProtein}g protein). ${workouts.length > 0 ? "Great job hitting the gym!" : "No workouts logged today."}`,
      recommendation: totalProtein < 150 ? "Aim for one more high-protein meal to hit your daily goal." : "You're killing it today! Keep up the momentum.",
    };
  }

  // Real OpenAI call
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are ApexFit, a highly motivating, elite fitness and nutrition coach. Always return JSON strictly formatted with keys: 'adherence' (e.g. 'On Track', 'Needs Work'), 'insight' (short 1-sentence observation), and 'recommendation' (1 actionable step).",
          },
          {
            role: "user",
            content: `User Profile: weight ${user.weight}kg, target ${user.targetWeight}kg, goal ${user.goal}. Today's totals: ${totalCals}kcals, ${totalProtein}g protein across ${meals.length} meals. Recent workouts: ${workouts.map((w: any) => w.name).join(", ")}. Provide structured feedback.`,
          },
        ],
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as { adherence: string, insight: string, recommendation: string };
  } catch (error) {
    console.error("OpenAI Error:", error);
    return {
      adherence: "Unknown",
      insight: "The AI Coach is currently resting between sets.",
      recommendation: "Could not fetch analysis."
    };
  }
}

export async function generateDailyMealPlan(remainingCals: number, remainingPro: number, remainingCarbs: number, remainingFats: number, preference: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const noApiKey = !apiKey || apiKey === "your-openai-api-key-here";

  if (noApiKey || remainingCals <= 0) {
    return [];
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an expert sports nutritionist. Generate a meal plan strictly formatted as JSON: { meals: [{ foodName: string, calories: number, protein: number, carbs: number, fats: number }] }.",
          },
          {
            role: "user",
            content: `Generate a daily meal plan with exactly 3 to 4 meals that together add up closely to: ${remainingCals} kcal, ${remainingPro}g protein, ${remainingCarbs}g carbs, ${remainingFats}g fats. Diet preference: ${preference}. Ensure food names are concise and realistic.`,
          },
        ],
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result.meals || [];
  } catch (error) {
    console.error("OpenAI Error:", error);
    return [];
  }
}

export async function askCoachQuestion(question: string, contextText: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    return { answer: "I'm currently resting. Please provide a valid OpenAI API key to wake me up!" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are the ApexFit AI coach. You help the user with fitness, diet, and training advice. Keep responses concise and highly actionable. Reference their current context if given.",
          },
          {
            role: "user",
            content: `User Context: ${contextText}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    const data = await response.json();
    return { answer: data.choices[0].message.content };
  } catch (error) {
    console.error("OpenAI Ask Error:", error);
    return { answer: "I encountered an error trying to process your question." };
  }
}
