"use server";

// ═══════════════════════════════════════════════════════════════════
// ApexFit Nutrition Engine — AI-powered calorie calculator
// Uses OpenAI for all food lookups with IFCT/NIN/USDA accuracy
// ═══════════════════════════════════════════════════════════════════

export type NutritionResult = {
  foodName: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  source: "ai";
};

export async function lookupNutrition(input: string): Promise<NutritionResult> {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Please enter a food item.");

  console.log(`[NutritionEngine] Looking up: "${trimmed}"`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    throw new Error("AI nutrition lookup is not configured. Please set your OpenAI API key.");
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
            content: `You are an expert nutrition database with deep knowledge of Indian foods (IFCT/NIN data), USDA data, and international cuisines. Given a food item and quantity, return ACCURATE nutritional data in JSON format:

{"calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number, "quantity": "human readable description"}

CRITICAL RULES:
- All macro values in grams, calories in kcal
- For Indian foods, use NIN/IFCT (National Institute of Nutrition / Indian Food Composition Tables) verified data
- 1 idli = ~40g, ~52 kcal. 8 idlis ≈ 416 kcal
- 1 egg = ~50g, ~78 kcal
- 1 chapati/roti = ~35g, ~84 kcal
- 1 dosa = ~80g, ~137 kcal
- 1 cup cooked rice = ~150g, ~195 kcal
- 1 tbsp oil/ghee = ~14-15g, ~120-135 kcal
- For combined items (e.g. "rice and sambar", "2 rotis with dal"), sum ALL components
- If quantity is specified (e.g. "200g", "3 pieces"), calculate for that exact amount
- If no quantity specified, assume 1 standard serving
- Be precise. Do NOT overestimate.
- Include the quantity description showing what you calculated for`,
          },
          { role: "user", content: `Nutritional info for: "${trimmed}"` },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`[NutritionEngine] OpenAI API error: ${response.status}`);
      throw new Error("Failed to look up nutrition data. Please try again.");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI. Please try again.");
    }

    const parsed = JSON.parse(content);

    const result: NutritionResult = {
      foodName: trimmed,
      quantity: parsed.quantity || trimmed,
      calories: Math.round(parsed.calories || 0),
      protein: Math.round(parsed.protein || 0),
      carbs: Math.round(parsed.carbs || 0),
      fats: Math.round(parsed.fats || 0),
      fiber: Math.round(parsed.fiber || 0),
      source: "ai",
    };

    console.log(`[NutritionEngine] AI result: ${result.calories} kcal, ${result.protein}g pro`);
    return result;
  } catch (err: any) {
    if (err.message?.includes("Failed to look up") || err.message?.includes("No response") || err.message?.includes("not configured")) {
      throw err;
    }
    console.error("[NutritionEngine] Lookup failed:", err);
    throw new Error(`Could not find nutritional data for "${trimmed}". Please try again.`);
  }
}
