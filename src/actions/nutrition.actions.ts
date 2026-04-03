"use server";

// Local food database — ALL values are per 100g for consistency
const FOOD_DB: Record<string, {
  cal: number; pro: number; carb: number; fat: number; fib: number;
  defaultServing: number; // default grams if no unit given
  servingLabel: string;   // human label for default serving
}> = {
  // Grains & Staples
  "rice":            { cal: 130, pro: 2.7, carb: 28, fat: 0.3, fib: 0.4, defaultServing: 150, servingLabel: "1 cup cooked (150g)" },
  "white rice":      { cal: 130, pro: 2.7, carb: 28, fat: 0.3, fib: 0.4, defaultServing: 150, servingLabel: "1 cup cooked (150g)" },
  "brown rice":      { cal: 112, pro: 2.6, carb: 24, fat: 0.9, fib: 1.8, defaultServing: 150, servingLabel: "1 cup cooked (150g)" },
  "oats":            { cal: 389, pro: 17, carb: 66, fat: 7, fib: 11, defaultServing: 40, servingLabel: "1/2 cup dry (40g)" },
  "pasta":           { cal: 131, pro: 5, carb: 25, fat: 1.1, fib: 1.8, defaultServing: 180, servingLabel: "1 cup cooked (180g)" },
  "bread":           { cal: 265, pro: 9, carb: 49, fat: 3.2, fib: 2.7, defaultServing: 30, servingLabel: "1 slice (30g)" },

  // Indian Flatbreads (per piece → converted to per 100g)
  "chapati":         { cal: 297, pro: 8.6, carb: 51, fat: 8.6, fib: 5.7, defaultServing: 35, servingLabel: "1 piece (35g)" },
  "roti":            { cal: 297, pro: 8.6, carb: 51, fat: 8.6, fib: 5.7, defaultServing: 35, servingLabel: "1 piece (35g)" },
  "paratha":         { cal: 326, pro: 7.3, carb: 45, fat: 13, fib: 3.6, defaultServing: 55, servingLabel: "1 piece (55g)" },
  "naan":            { cal: 291, pro: 10, carb: 50, fat: 5.5, fib: 2.2, defaultServing: 90, servingLabel: "1 piece (90g)" },
  "dosa":            { cal: 171, pro: 4.3, carb: 26, fat: 5.7, fib: 1.4, defaultServing: 70, servingLabel: "1 piece (70g)" },
  "idli":            { cal: 130, pro: 5, carb: 27, fat: 0.7, fib: 1.7, defaultServing: 30, servingLabel: "1 piece (30g)" },
  "poha":            { cal: 130, pro: 2.9, carb: 25, fat: 2.9, fib: 0.7, defaultServing: 140, servingLabel: "1 cup (140g)" },
  "upma":            { cal: 118, pro: 3.5, carb: 18, fat: 3.5, fib: 1.2, defaultServing: 170, servingLabel: "1 cup (170g)" },

  // Proteins
  "chicken breast":  { cal: 165, pro: 31, carb: 0, fat: 3.6, fib: 0, defaultServing: 150, servingLabel: "1 piece (150g)" },
  "chicken":         { cal: 165, pro: 31, carb: 0, fat: 3.6, fib: 0, defaultServing: 150, servingLabel: "1 piece (150g)" },
  "egg":             { cal: 155, pro: 13, carb: 1.1, fat: 11, fib: 0, defaultServing: 50, servingLabel: "1 large (50g)" },
  "eggs":            { cal: 155, pro: 13, carb: 1.1, fat: 11, fib: 0, defaultServing: 50, servingLabel: "1 large (50g)" },
  "paneer":          { cal: 265, pro: 18, carb: 1.2, fat: 21, fib: 0, defaultServing: 100, servingLabel: "100g" },
  "tofu":            { cal: 76, pro: 8, carb: 1.9, fat: 4.8, fib: 0.3, defaultServing: 100, servingLabel: "100g" },
  "salmon":          { cal: 208, pro: 20, carb: 0, fat: 13, fib: 0, defaultServing: 150, servingLabel: "1 fillet (150g)" },
  "whey protein":    { cal: 400, pro: 80, carb: 10, fat: 3.3, fib: 0, defaultServing: 30, servingLabel: "1 scoop (30g)" },
  "protein shake":   { cal: 400, pro: 80, carb: 10, fat: 3.3, fib: 0, defaultServing: 30, servingLabel: "1 scoop (30g)" },

  // Indian Curries & Dishes (per 100g cooked)
  "dal":             { cal: 75, pro: 5, carb: 12.5, fat: 0.4, fib: 3.3, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "toor dal":        { cal: 75, pro: 5, carb: 12.5, fat: 0.4, fib: 3.3, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "sambar":          { cal: 54, pro: 2.5, carb: 7.5, fat: 1.3, fib: 1.7, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "samber":          { cal: 54, pro: 2.5, carb: 7.5, fat: 1.3, fib: 1.7, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "chicken biryani": { cal: 163, pro: 9.3, carb: 18.3, fat: 5.3, fib: 0.7, defaultServing: 300, servingLabel: "1 plate (300g)" },
  "chicken curry":   { cal: 133, pro: 10, carb: 5, fat: 8.3, fib: 0.8, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "mutton curry":    { cal: 175, pro: 12, carb: 4.2, fat: 12.5, fib: 0.4, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "fish curry":      { cal: 104, pro: 9.2, carb: 3.3, fat: 5.8, fib: 0.4, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "palak paneer":    { cal: 117, pro: 6.7, carb: 4.2, fat: 8.3, fib: 1.3, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "rajma":           { cal: 88, pro: 5.4, carb: 14.6, fat: 0.8, fib: 3.3, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "chole":           { cal: 100, pro: 5, carb: 15.8, fat: 2.1, fib: 4.2, defaultServing: 240, servingLabel: "1 cup (240g)" },
  "aloo gobi":       { cal: 67, pro: 1.7, carb: 9.2, fat: 2.9, fib: 1.7, defaultServing: 240, servingLabel: "1 cup (240g)" },

  // Dairy
  "milk":            { cal: 62, pro: 3.3, carb: 5, fat: 3.3, fib: 0, defaultServing: 240, servingLabel: "1 cup (240ml)" },
  "curd":            { cal: 61, pro: 3.5, carb: 4.7, fat: 3.3, fib: 0, defaultServing: 170, servingLabel: "1 cup (170g)" },
  "yogurt":          { cal: 61, pro: 3.5, carb: 4.7, fat: 3.3, fib: 0, defaultServing: 170, servingLabel: "1 cup (170g)" },
  "greek yogurt":    { cal: 59, pro: 10, carb: 3.6, fat: 0.4, fib: 0, defaultServing: 200, servingLabel: "1 cup (200g)" },

  // Fruits & Snacks
  "banana":          { cal: 89, pro: 1.1, carb: 23, fat: 0.3, fib: 2.6, defaultServing: 118, servingLabel: "1 medium (118g)" },
  "apple":           { cal: 52, pro: 0.3, carb: 14, fat: 0.2, fib: 2.4, defaultServing: 182, servingLabel: "1 medium (182g)" },
  "almonds":         { cal: 579, pro: 21, carb: 22, fat: 50, fib: 12.5, defaultServing: 28, servingLabel: "1 handful (28g)" },
  "peanut butter":   { cal: 588, pro: 25, carb: 20, fat: 50, fib: 6, defaultServing: 32, servingLabel: "2 tbsp (32g)" },
  "avocado":         { cal: 160, pro: 2, carb: 8.5, fat: 15, fib: 6.7, defaultServing: 150, servingLabel: "1 whole (150g)" },
  "sweet potato":    { cal: 86, pro: 1.6, carb: 20, fat: 0.1, fib: 3, defaultServing: 130, servingLabel: "1 medium (130g)" },

  // Fast Food
  "pizza":           { cal: 266, pro: 11, carb: 33, fat: 10, fib: 2.3, defaultServing: 107, servingLabel: "1 slice (107g)" },
  "burger":          { cal: 254, pro: 14, carb: 21, fat: 12, fib: 0.7, defaultServing: 140, servingLabel: "1 piece (140g)" },
};

export type NutritionResult = {
  foodName: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  source: "ai" | "database" | "estimate";
};

// Parse input into grams or count
type ParsedInput = {
  grams: number | null;   // if user specified grams
  count: number | null;    // if user specified count (e.g. "2 eggs")
  foodKey: string;
  originalName: string;
  isComplex: boolean;      // contains "and", "with", commas
};

function parseInput(input: string): ParsedInput {
  const raw = input.trim();
  const trimmed = raw.toLowerCase();

  // Complex inputs with "and", "with", commas → route to AI
  if (/\band\b|\bwith\b|,/.test(trimmed)) {
    return { grams: null, count: null, foodKey: trimmed, originalName: raw, isComplex: true };
  }

  // Match "200g rice", "200 g chicken", "150gm paneer"
  const gramMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\s+(.+)$/);
  if (gramMatch) {
    return { grams: parseFloat(gramMatch[1]), count: null, foodKey: gramMatch[2].trim(), originalName: raw, isComplex: false };
  }

  // Match "200ml milk"
  const mlMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:ml)\s+(.+)$/);
  if (mlMatch) {
    return { grams: parseFloat(mlMatch[1]), count: null, foodKey: mlMatch[2].trim(), originalName: raw, isComplex: false };
  }

  // Match "2 eggs", "3 chapati", "1 plate biryani"
  const countMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (countMatch) {
    return { grams: null, count: parseFloat(countMatch[1]), foodKey: countMatch[2].trim(), originalName: raw, isComplex: false };
  }

  // "half plate biryani"
  if (trimmed.startsWith("half ")) {
    return { grams: null, count: 0.5, foodKey: trimmed.replace("half ", "").trim(), originalName: raw, isComplex: false };
  }

  return { grams: null, count: 1, foodKey: trimmed, originalName: raw, isComplex: false };
}

function lookupLocal(foodKey: string): { key: string; data: (typeof FOOD_DB)[string] } | null {
  // Direct match
  if (FOOD_DB[foodKey]) return { key: foodKey, data: FOOD_DB[foodKey] };

  // Strip "plate", "cup", "bowl" prefixes
  const stripped = foodKey.replace(/^(plate|cup|bowl|serving|piece|pieces)\s+/i, "").trim();
  if (FOOD_DB[stripped]) return { key: stripped, data: FOOD_DB[stripped] };

  // Partial match (food key contains DB key or vice versa)
  for (const [key, val] of Object.entries(FOOD_DB)) {
    if (foodKey.includes(key) || key.includes(foodKey)) {
      return { key, data: val };
    }
  }
  return null;
}

function calcFromDb(
  data: (typeof FOOD_DB)[string],
  grams: number | null,
  count: number | null
): { calories: number; protein: number; carbs: number; fats: number; fiber: number; quantity: string } {
  let actualGrams: number;
  let quantityLabel: string;

  if (grams !== null) {
    // User specified grams directly → use as-is
    actualGrams = grams;
    quantityLabel = `${grams}g`;
  } else if (count !== null) {
    // User specified count → multiply default serving
    actualGrams = data.defaultServing * count;
    quantityLabel = `${count} × ${data.servingLabel}`;
  } else {
    actualGrams = data.defaultServing;
    quantityLabel = data.servingLabel;
  }

  const mult = actualGrams / 100;

  return {
    calories: Math.round(data.cal * mult),
    protein: Math.round(data.pro * mult),
    carbs: Math.round(data.carb * mult),
    fats: Math.round(data.fat * mult),
    fiber: Math.round(data.fib * mult),
    quantity: quantityLabel,
  };
}

async function lookupViaAI(input: string, originalName: string): Promise<NutritionResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your-openai-api-key-here") return null;

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
            content: `You are a nutrition database. Given a food item and quantity, return accurate nutritional estimates in JSON: {"calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number, "quantity": "description"}. All macro values in grams, calories in kcal. Use USDA or Indian food composition data. For combined items (e.g. "rice and sambar"), sum all components.`,
          },
          { role: "user", content: `Nutritional info for: "${input}"` },
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return {
        foodName: originalName,
        quantity: parsed.quantity || input,
        calories: Math.round(parsed.calories || 0),
        protein: Math.round(parsed.protein || 0),
        carbs: Math.round(parsed.carbs || 0),
        fats: Math.round(parsed.fats || 0),
        fiber: Math.round(parsed.fiber || 0),
        source: "ai",
      };
    }
  } catch (err) {
    console.error("[ApexFit] OpenAI nutrition lookup failed:", err);
  }

  return null;
}

// Split compound input into parts and look up each from local DB
function lookupCompoundLocal(input: string): NutritionResult | null {
  // Split on "and", "with", "&", commas
  const parts = input
    .toLowerCase()
    .split(/\s+and\s+|\s+with\s+|\s*&\s*|\s*,\s*/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length === 0) return null;

  let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0, totalFib = 0;
  const quantityParts: string[] = [];
  let matchCount = 0;

  for (const part of parts) {
    const partParsed = parseInput(part + " "); // add space to avoid complex re-detection
    // Re-parse without complex flag
    const trimmed = part.trim().toLowerCase();

    // Try gram pattern
    const gramMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\s+(.+)$/);
    const mlMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:ml)\s+(.+)$/);
    const countMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);

    let grams: number | null = null;
    let count: number | null = null;
    let foodKey = trimmed;

    if (gramMatch) {
      grams = parseFloat(gramMatch[1]);
      foodKey = gramMatch[2].trim();
    } else if (mlMatch) {
      grams = parseFloat(mlMatch[1]);
      foodKey = mlMatch[2].trim();
    } else if (countMatch) {
      count = parseFloat(countMatch[1]);
      foodKey = countMatch[2].trim();
    } else {
      count = 1;
    }

    const match = lookupLocal(foodKey);
    if (match) {
      const result = calcFromDb(match.data, grams, count);
      totalCal += result.calories;
      totalPro += result.protein;
      totalCarb += result.carbs;
      totalFat += result.fats;
      totalFib += result.fiber;
      quantityParts.push(result.quantity);
      matchCount++;
    }
  }

  // Only return if we matched at least one part
  if (matchCount === 0) return null;

  return {
    foodName: input.trim(),
    quantity: quantityParts.join(" + "),
    calories: totalCal,
    protein: totalPro,
    carbs: totalCarb,
    fats: totalFat,
    fiber: totalFib,
    source: "database",
  };
}

export async function lookupNutrition(input: string): Promise<NutritionResult> {
  const parsed = parseInput(input);

  // Complex queries (with "and", "with") → try AI first, then local compound split
  if (parsed.isComplex) {
    const aiResult = await lookupViaAI(input, parsed.originalName);
    if (aiResult) return aiResult;

    // AI unavailable — try splitting and looking up each part locally
    const compoundResult = lookupCompoundLocal(input);
    if (compoundResult) return compoundResult;
  }

  // Try local database for simple queries
  if (!parsed.isComplex) {
    const match = lookupLocal(parsed.foodKey);
    if (match) {
      const result = calcFromDb(match.data, parsed.grams, parsed.count);
      return {
        foodName: parsed.originalName,
        quantity: result.quantity,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        fiber: result.fiber,
        source: "database",
      };
    }
  }

  // Try AI for unrecognized single foods
  const aiResult = await lookupViaAI(input, parsed.originalName);
  if (aiResult) return aiResult;

  // Fallback estimate
  const servings = parsed.count || 1;
  return {
    foodName: parsed.originalName,
    quantity: `${servings} serving(s)`,
    calories: Math.round(200 * servings),
    protein: Math.round(10 * servings),
    carbs: Math.round(25 * servings),
    fats: Math.round(8 * servings),
    fiber: Math.round(2 * servings),
    source: "estimate",
  };
}
