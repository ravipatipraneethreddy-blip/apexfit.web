"use server";

// ═══════════════════════════════════════════════════════════════════
// ApexFit Nutrition Engine v2 — Production-grade calorie calculator
// All values: per 100g | Using IFCT/NIN/USDA verified data
// ═══════════════════════════════════════════════════════════════════

// Data model for each food item
type FoodEntry = {
  cal: number;           // kcal per 100g
  pro: number;           // protein per 100g
  carb: number;          // carbs per 100g
  fat: number;           // fat per 100g
  fib: number;           // fiber per 100g
  defaultUnit: "g" | "piece" | "ml" | "cup" | "tbsp" | "scoop";
  weightPerUnit: number; // grams per 1 unit (for piece-based foods)
  servingLabel: string;  // human-readable serving description
  aliases?: string[];    // alternate names for fuzzy matching
};

// ─── FOOD DATABASE ─── All values per 100g ───────────────────────
const FOOD_DB: Record<string, FoodEntry> = {

  // ══ Grains & Staples ══
  "rice": {
    cal: 130, pro: 2.7, carb: 28, fat: 0.3, fib: 0.4,
    defaultUnit: "cup", weightPerUnit: 150, servingLabel: "1 cup cooked (150g)",
    aliases: ["white rice", "cooked rice", "steamed rice", "plain rice"],
  },
  "brown rice": {
    cal: 112, pro: 2.6, carb: 24, fat: 0.9, fib: 1.8,
    defaultUnit: "cup", weightPerUnit: 150, servingLabel: "1 cup cooked (150g)",
  },
  "raw rice": {
    cal: 360, pro: 6.8, carb: 79, fat: 0.5, fib: 0.2,
    defaultUnit: "g", weightPerUnit: 100, servingLabel: "100g dry",
    aliases: ["uncooked rice", "dry rice"],
  },
  "oats": {
    cal: 389, pro: 17, carb: 66, fat: 7, fib: 11,
    defaultUnit: "cup", weightPerUnit: 40, servingLabel: "1/2 cup dry (40g)",
    aliases: ["oatmeal", "rolled oats"],
  },
  "pasta": {
    cal: 131, pro: 5, carb: 25, fat: 1.1, fib: 1.8,
    defaultUnit: "cup", weightPerUnit: 180, servingLabel: "1 cup cooked (180g)",
    aliases: ["spaghetti", "macaroni", "penne", "noodles"],
  },
  "bread": {
    cal: 265, pro: 9, carb: 49, fat: 3.2, fib: 2.7,
    defaultUnit: "piece", weightPerUnit: 30, servingLabel: "1 slice (30g)",
    aliases: ["bread slice", "toast", "white bread", "brown bread"],
  },

  // ══ Indian Flatbreads ══ (IFCT/NIN verified)
  "chapati": {
    cal: 240, pro: 8.7, carb: 50, fat: 1.0, fib: 1.9,
    defaultUnit: "piece", weightPerUnit: 35, servingLabel: "1 piece (35g)",
    aliases: ["chapathi", "phulka"],
  },
  "roti": {
    cal: 240, pro: 8.7, carb: 50, fat: 1.0, fib: 1.9,
    defaultUnit: "piece", weightPerUnit: 35, servingLabel: "1 piece (35g)",
    aliases: ["rotis", "wheat roti"],
  },
  "paratha": {
    cal: 326, pro: 7.3, carb: 45, fat: 13, fib: 3.6,
    defaultUnit: "piece", weightPerUnit: 60, servingLabel: "1 piece (60g)",
    aliases: ["parata", "parantha", "aloo paratha"],
  },
  "naan": {
    cal: 291, pro: 10, carb: 50, fat: 5.5, fib: 2.2,
    defaultUnit: "piece", weightPerUnit: 90, servingLabel: "1 piece (90g)",
    aliases: ["naan bread", "butter naan", "garlic naan"],
  },
  "puri": {
    cal: 324, pro: 7.5, carb: 45, fat: 13, fib: 2.0,
    defaultUnit: "piece", weightPerUnit: 25, servingLabel: "1 piece (25g)",
    aliases: ["poori", "puris", "pooris"],
  },

  // ══ South Indian (IFCT verified weights) ══
  "idli": {
    cal: 130, pro: 4.1, carb: 25.8, fat: 0.5, fib: 1.0,
    defaultUnit: "piece", weightPerUnit: 40, servingLabel: "1 piece (40g)",
    aliases: ["idlis", "idly", "idlies", "idle", "idles", "steamed idli"],
  },
  "dosa": {
    cal: 171, pro: 4.3, carb: 26, fat: 5.7, fib: 1.4,
    defaultUnit: "piece", weightPerUnit: 80, servingLabel: "1 piece (80g)",
    aliases: ["dosas", "plain dosa", "sada dosa"],
  },
  "masala dosa": {
    cal: 165, pro: 4.0, carb: 24, fat: 5.5, fib: 1.8,
    defaultUnit: "piece", weightPerUnit: 150, servingLabel: "1 piece (150g)",
    aliases: ["masaladosa"],
  },
  "vada": {
    cal: 290, pro: 12, carb: 26, fat: 16, fib: 3.0,
    defaultUnit: "piece", weightPerUnit: 45, servingLabel: "1 piece (45g)",
    aliases: ["vadas", "medu vada", "vadai", "urad vada"],
  },
  "poha": {
    cal: 130, pro: 2.9, carb: 25, fat: 2.9, fib: 0.7,
    defaultUnit: "cup", weightPerUnit: 140, servingLabel: "1 cup (140g)",
    aliases: ["flattened rice", "aval"],
  },
  "upma": {
    cal: 118, pro: 3.5, carb: 18, fat: 3.5, fib: 1.2,
    defaultUnit: "cup", weightPerUnit: 170, servingLabel: "1 cup (170g)",
    aliases: ["uppma", "rava upma"],
  },
  "pongal": {
    cal: 120, pro: 3.5, carb: 18, fat: 3.8, fib: 1.0,
    defaultUnit: "cup", weightPerUnit: 200, servingLabel: "1 cup (200g)",
    aliases: ["ven pongal", "khara pongal"],
  },
  "uttapam": {
    cal: 160, pro: 5, carb: 24, fat: 5, fib: 1.5,
    defaultUnit: "piece", weightPerUnit: 120, servingLabel: "1 piece (120g)",
    aliases: ["uthappam", "utappam"],
  },
  "pesarattu": {
    cal: 150, pro: 7, carb: 20, fat: 4.5, fib: 2.5,
    defaultUnit: "piece", weightPerUnit: 90, servingLabel: "1 piece (90g)",
  },

  // ══ Proteins ══
  "chicken breast": {
    cal: 165, pro: 31, carb: 0, fat: 3.6, fib: 0,
    defaultUnit: "piece", weightPerUnit: 150, servingLabel: "1 piece cooked (150g)",
    aliases: ["grilled chicken", "chicken breast cooked"],
  },
  "chicken": {
    cal: 239, pro: 27, carb: 0, fat: 14, fib: 0,
    defaultUnit: "piece", weightPerUnit: 150, servingLabel: "1 serving (150g)",
    aliases: ["chicken thigh", "chicken leg", "cooked chicken"],
  },
  "raw chicken": {
    cal: 120, pro: 22, carb: 0, fat: 3.1, fib: 0,
    defaultUnit: "g", weightPerUnit: 100, servingLabel: "100g raw",
    aliases: ["uncooked chicken"],
  },
  "egg": {
    cal: 155, pro: 13, carb: 1.1, fat: 11, fib: 0,
    defaultUnit: "piece", weightPerUnit: 50, servingLabel: "1 large (50g)",
    aliases: ["eggs", "boiled egg", "boiled eggs", "egg boiled", "fried egg", "scrambled egg", "omelette", "omelet"],
  },
  "egg white": {
    cal: 52, pro: 11, carb: 0.7, fat: 0.2, fib: 0,
    defaultUnit: "piece", weightPerUnit: 33, servingLabel: "1 large white (33g)",
    aliases: ["egg whites"],
  },
  "paneer": {
    cal: 265, pro: 18, carb: 1.2, fat: 21, fib: 0,
    defaultUnit: "g", weightPerUnit: 100, servingLabel: "100g",
    aliases: ["cottage cheese", "panir"],
  },
  "tofu": {
    cal: 76, pro: 8, carb: 1.9, fat: 4.8, fib: 0.3,
    defaultUnit: "g", weightPerUnit: 100, servingLabel: "100g",
    aliases: ["soy paneer"],
  },
  "salmon": {
    cal: 208, pro: 20, carb: 0, fat: 13, fib: 0,
    defaultUnit: "piece", weightPerUnit: 150, servingLabel: "1 fillet (150g)",
    aliases: ["salmon fillet"],
  },
  "fish": {
    cal: 120, pro: 20, carb: 0, fat: 4, fib: 0,
    defaultUnit: "piece", weightPerUnit: 120, servingLabel: "1 piece (120g)",
    aliases: ["fried fish", "grilled fish", "fish fry"],
  },
  "prawns": {
    cal: 85, pro: 20, carb: 0, fat: 0.5, fib: 0,
    defaultUnit: "g", weightPerUnit: 100, servingLabel: "100g",
    aliases: ["shrimp", "shrimps"],
  },
  "whey protein": {
    cal: 400, pro: 80, carb: 10, fat: 3.3, fib: 0,
    defaultUnit: "scoop", weightPerUnit: 30, servingLabel: "1 scoop (30g)",
    aliases: ["protein shake", "protein powder", "whey"],
  },

  // ══ Indian Curries & Dishes (per 100g cooked, IFCT) ══
  "dal": {
    cal: 75, pro: 5, carb: 12.5, fat: 0.4, fib: 3.3,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["toor dal", "yellow dal", "arhar dal", "moong dal", "daal"],
  },
  "sambar": {
    cal: 54, pro: 2.5, carb: 7.5, fat: 1.3, fib: 1.7,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["samber", "sambhar"],
  },
  "rasam": {
    cal: 30, pro: 1.5, carb: 5, fat: 0.5, fib: 0.5,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["rasam soup"],
  },
  "chicken biryani": {
    cal: 163, pro: 9.3, carb: 18.3, fat: 5.3, fib: 0.7,
    defaultUnit: "piece", weightPerUnit: 300, servingLabel: "1 plate (300g)",
    aliases: ["biryani", "biriyani", "briyani", "dum biryani"],
  },
  "veg biryani": {
    cal: 140, pro: 3.5, carb: 22, fat: 4, fib: 1.5,
    defaultUnit: "piece", weightPerUnit: 300, servingLabel: "1 plate (300g)",
    aliases: ["vegetable biryani"],
  },
  "chicken curry": {
    cal: 133, pro: 10, carb: 5, fat: 8.3, fib: 0.8,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["chicken gravy", "chicken masala"],
  },
  "mutton curry": {
    cal: 175, pro: 12, carb: 4.2, fat: 12.5, fib: 0.4,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["mutton gravy", "goat curry", "lamb curry"],
  },
  "fish curry": {
    cal: 104, pro: 9.2, carb: 3.3, fat: 5.8, fib: 0.4,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
  },
  "palak paneer": {
    cal: 117, pro: 6.7, carb: 4.2, fat: 8.3, fib: 1.3,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["spinach paneer"],
  },
  "rajma": {
    cal: 88, pro: 5.4, carb: 14.6, fat: 0.8, fib: 3.3,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["rajma masala", "kidney beans curry", "kidney beans"],
  },
  "chole": {
    cal: 100, pro: 5, carb: 15.8, fat: 2.1, fib: 4.2,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["chana masala", "chickpea curry", "chhole", "chole masala"],
  },
  "aloo gobi": {
    cal: 67, pro: 1.7, carb: 9.2, fat: 2.9, fib: 1.7,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240g)",
    aliases: ["aloo gobhi", "potato cauliflower"],
  },
  "aloo fry": {
    cal: 150, pro: 2, carb: 20, fat: 7, fib: 2.0,
    defaultUnit: "cup", weightPerUnit: 150, servingLabel: "1 serving (150g)",
    aliases: ["fried potatoes", "aloo bhaji", "potato fry"],
  },

  // ══ Dairy ══
  "milk": {
    cal: 62, pro: 3.3, carb: 5, fat: 3.3, fib: 0,
    defaultUnit: "ml", weightPerUnit: 240, servingLabel: "1 cup (240ml)",
    aliases: ["whole milk", "full cream milk"],
  },
  "skim milk": {
    cal: 34, pro: 3.4, carb: 5, fat: 0.1, fib: 0,
    defaultUnit: "ml", weightPerUnit: 240, servingLabel: "1 cup (240ml)",
    aliases: ["fat free milk", "nonfat milk", "toned milk"],
  },
  "curd": {
    cal: 61, pro: 3.5, carb: 4.7, fat: 3.3, fib: 0,
    defaultUnit: "cup", weightPerUnit: 170, servingLabel: "1 cup (170g)",
    aliases: ["dahi", "yogurt", "plain yogurt"],
  },
  "greek yogurt": {
    cal: 59, pro: 10, carb: 3.6, fat: 0.4, fib: 0,
    defaultUnit: "cup", weightPerUnit: 200, servingLabel: "1 cup (200g)",
  },
  "buttermilk": {
    cal: 31, pro: 2.5, carb: 3.5, fat: 0.7, fib: 0,
    defaultUnit: "ml", weightPerUnit: 240, servingLabel: "1 glass (240ml)",
    aliases: ["chaas", "majjiga", "chaach", "mor"],
  },
  "lassi": {
    cal: 72, pro: 2.5, carb: 12, fat: 1.5, fib: 0,
    defaultUnit: "ml", weightPerUnit: 250, servingLabel: "1 glass (250ml)",
    aliases: ["sweet lassi", "mango lassi"],
  },
  "ghee": {
    cal: 900, pro: 0, carb: 0, fat: 100, fib: 0,
    defaultUnit: "tbsp", weightPerUnit: 14, servingLabel: "1 tbsp (14g)",
    aliases: ["clarified butter", "desi ghee"],
  },
  "butter": {
    cal: 717, pro: 0.9, carb: 0.1, fat: 81, fib: 0,
    defaultUnit: "tbsp", weightPerUnit: 14, servingLabel: "1 tbsp (14g)",
    aliases: ["amul butter"],
  },
  "cheese": {
    cal: 402, pro: 25, carb: 1.3, fat: 33, fib: 0,
    defaultUnit: "piece", weightPerUnit: 20, servingLabel: "1 slice (20g)",
    aliases: ["cheese slice", "cheddar"],
  },

  // ══ Cooking Oils & Fats ══
  "oil": {
    cal: 884, pro: 0, carb: 0, fat: 100, fib: 0,
    defaultUnit: "tbsp", weightPerUnit: 15, servingLabel: "1 tbsp (15g)",
    aliases: ["cooking oil", "vegetable oil", "sunflower oil", "olive oil", "coconut oil", "mustard oil", "groundnut oil", "sesame oil", "canola oil"],
  },

  // ══ Fruits ══
  "banana": {
    cal: 89, pro: 1.1, carb: 23, fat: 0.3, fib: 2.6,
    defaultUnit: "piece", weightPerUnit: 118, servingLabel: "1 medium (118g)",
    aliases: ["bananas"],
  },
  "apple": {
    cal: 52, pro: 0.3, carb: 14, fat: 0.2, fib: 2.4,
    defaultUnit: "piece", weightPerUnit: 182, servingLabel: "1 medium (182g)",
    aliases: ["apples"],
  },
  "mango": {
    cal: 60, pro: 0.8, carb: 15, fat: 0.4, fib: 1.6,
    defaultUnit: "piece", weightPerUnit: 200, servingLabel: "1 medium (200g)",
    aliases: ["mangoes", "mangos"],
  },
  "papaya": {
    cal: 43, pro: 0.5, carb: 11, fat: 0.3, fib: 1.7,
    defaultUnit: "cup", weightPerUnit: 145, servingLabel: "1 cup (145g)",
  },
  "orange": {
    cal: 47, pro: 0.9, carb: 12, fat: 0.1, fib: 2.4,
    defaultUnit: "piece", weightPerUnit: 130, servingLabel: "1 medium (130g)",
    aliases: ["oranges"],
  },
  "watermelon": {
    cal: 30, pro: 0.6, carb: 8, fat: 0.2, fib: 0.4,
    defaultUnit: "cup", weightPerUnit: 150, servingLabel: "1 cup (150g)",
  },

  // ══ Nuts & Seeds ══
  "almonds": {
    cal: 579, pro: 21, carb: 22, fat: 50, fib: 12.5,
    defaultUnit: "piece", weightPerUnit: 1.2, servingLabel: "1 almond (1.2g)",
    aliases: ["almond", "badam"],
  },
  "cashew": {
    cal: 553, pro: 18, carb: 30, fat: 44, fib: 3.3,
    defaultUnit: "piece", weightPerUnit: 1.5, servingLabel: "1 cashew (1.5g)",
    aliases: ["cashews", "kaju", "cashew nuts"],
  },
  "peanuts": {
    cal: 567, pro: 26, carb: 16, fat: 49, fib: 8.5,
    defaultUnit: "g", weightPerUnit: 30, servingLabel: "1 handful (30g)",
    aliases: ["groundnuts", "moongphali", "peanut"],
  },
  "peanut butter": {
    cal: 588, pro: 25, carb: 20, fat: 50, fib: 6,
    defaultUnit: "tbsp", weightPerUnit: 32, servingLabel: "2 tbsp (32g)",
  },
  "walnuts": {
    cal: 654, pro: 15, carb: 14, fat: 65, fib: 6.7,
    defaultUnit: "piece", weightPerUnit: 4, servingLabel: "1 walnut half (4g)",
    aliases: ["walnut", "akhrot"],
  },

  // ══ Sweets & Snacks ══
  "avocado": {
    cal: 160, pro: 2, carb: 8.5, fat: 15, fib: 6.7,
    defaultUnit: "piece", weightPerUnit: 150, servingLabel: "1 whole (150g)",
  },
  "sweet potato": {
    cal: 86, pro: 1.6, carb: 20, fat: 0.1, fib: 3,
    defaultUnit: "piece", weightPerUnit: 130, servingLabel: "1 medium (130g)",
    aliases: ["shakarkandi"],
  },
  "samosa": {
    cal: 262, pro: 5.5, carb: 28, fat: 14, fib: 2.0,
    defaultUnit: "piece", weightPerUnit: 80, servingLabel: "1 piece (80g)",
    aliases: ["samosas"],
  },
  "jalebi": {
    cal: 380, pro: 2, carb: 60, fat: 15, fib: 0,
    defaultUnit: "piece", weightPerUnit: 30, servingLabel: "1 piece (30g)",
    aliases: ["jalebis"],
  },
  "gulab jamun": {
    cal: 325, pro: 5, carb: 50, fat: 12, fib: 0,
    defaultUnit: "piece", weightPerUnit: 40, servingLabel: "1 piece (40g)",
    aliases: ["gulab jamuns", "gulabjamun"],
  },
  "laddu": {
    cal: 450, pro: 8, carb: 55, fat: 22, fib: 2.0,
    defaultUnit: "piece", weightPerUnit: 40, servingLabel: "1 piece (40g)",
    aliases: ["ladoo", "laddoo", "besan laddu", "motichoor laddu"],
  },

  // ══ Fast Food ══
  "pizza": {
    cal: 266, pro: 11, carb: 33, fat: 10, fib: 2.3,
    defaultUnit: "piece", weightPerUnit: 107, servingLabel: "1 slice (107g)",
    aliases: ["pizza slice"],
  },
  "burger": {
    cal: 254, pro: 14, carb: 21, fat: 12, fib: 0.7,
    defaultUnit: "piece", weightPerUnit: 140, servingLabel: "1 piece (140g)",
    aliases: ["hamburger", "veg burger"],
  },

  // ══ Beverages ══
  "tea": {
    cal: 30, pro: 0.5, carb: 5, fat: 0.8, fib: 0,
    defaultUnit: "cup", weightPerUnit: 150, servingLabel: "1 cup with milk (150ml)",
    aliases: ["chai", "masala tea", "masala chai", "milk tea"],
  },
  "coffee": {
    cal: 35, pro: 0.8, carb: 4, fat: 1.5, fib: 0,
    defaultUnit: "cup", weightPerUnit: 150, servingLabel: "1 cup with milk (150ml)",
    aliases: ["filter coffee", "kaapi", "milk coffee"],
  },
  "black coffee": {
    cal: 2, pro: 0.3, carb: 0, fat: 0, fib: 0,
    defaultUnit: "cup", weightPerUnit: 240, servingLabel: "1 cup (240ml)",
    aliases: ["americano", "espresso"],
  },
  "coconut water": {
    cal: 19, pro: 0.7, carb: 3.7, fat: 0.2, fib: 1.1,
    defaultUnit: "ml", weightPerUnit: 250, servingLabel: "1 glass (250ml)",
    aliases: ["tender coconut", "nariyal pani"],
  },
};

// ─── Build alias lookup map for O(1) matching ────────────────────
const ALIAS_MAP = new Map<string, string>();
for (const [key, entry] of Object.entries(FOOD_DB)) {
  ALIAS_MAP.set(key, key);
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      ALIAS_MAP.set(alias, key);
    }
  }
}

// ─── Types ───────────────────────────────────────────────────────
export type NutritionResult = {
  foodName: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  source: "ai" | "database" | "estimate";
  debug?: string; // Debug trace for troubleshooting
};

type ParsedInput = {
  grams: number | null;
  count: number | null;
  foodKey: string;
  originalName: string;
  isComplex: boolean;
};

// ─── STEP 1: Parse user input ────────────────────────────────────
function parseInput(input: string): ParsedInput {
  const raw = input.trim();
  const trimmed = raw.toLowerCase();

  // Complex inputs with "and", "with", commas → route to compound/AI
  if (/\band\b|\bwith\b|,/.test(trimmed)) {
    return { grams: null, count: null, foodKey: trimmed, originalName: raw, isComplex: true };
  }

  // Match "200g rice", "200 g chicken", "150gm paneer"
  const gramMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grams)\s+(.+)$/);
  if (gramMatch) {
    return { grams: parseFloat(gramMatch[1]), count: null, foodKey: gramMatch[2].trim(), originalName: raw, isComplex: false };
  }

  // Match "200ml milk"
  const mlMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:ml|mls)\s+(.+)$/);
  if (mlMatch) {
    return { grams: parseFloat(mlMatch[1]), count: null, foodKey: mlMatch[2].trim(), originalName: raw, isComplex: false };
  }

  // Match "2 tbsp oil", "1 tablespoon ghee"
  const tbspMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons)\s+(.+)$/);
  if (tbspMatch) {
    const tbspCount = parseFloat(tbspMatch[1]);
    const isTsp = /tsp|teaspoon/.test(tbspMatch[0]);
    // 1 tsp ≈ 5g, 1 tbsp ≈ 15g
    return { grams: null, count: tbspCount * (isTsp ? 0.33 : 1), foodKey: tbspMatch[2].trim(), originalName: raw, isComplex: false };
  }

  // Match "2 cup rice", "1 glass milk"
  const cupMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:cups?|glass|glasses|bowls?)\s+(.+)$/);
  if (cupMatch) {
    return { grams: null, count: parseFloat(cupMatch[1]), foodKey: cupMatch[2].trim(), originalName: raw, isComplex: false };
  }

  // Match "2 eggs", "3 chapati", "8 idli", "1 plate biryani"
  const countMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (countMatch) {
    // Strip "plate", "piece", "pieces" from food key
    let foodKey = countMatch[2].trim();
    foodKey = foodKey.replace(/^(plates?\s+|pieces?\s+|servings?\s+)/i, "");
    return { grams: null, count: parseFloat(countMatch[1]), foodKey, originalName: raw, isComplex: false };
  }

  // "half plate biryani"
  if (trimmed.startsWith("half ")) {
    let foodKey = trimmed.replace("half ", "").trim();
    foodKey = foodKey.replace(/^(plates?\s+|pieces?\s+|servings?\s+)/i, "");
    return { grams: null, count: 0.5, foodKey, originalName: raw, isComplex: false };
  }

  return { grams: null, count: 1, foodKey: trimmed, originalName: raw, isComplex: false };
}

// ─── STEP 2: Lookup food in local DB ─────────────────────────────
function lookupLocal(foodKey: string): { key: string; data: FoodEntry } | null {
  // 1. Direct match
  if (FOOD_DB[foodKey]) return { key: foodKey, data: FOOD_DB[foodKey] };

  // 2. Alias match (O(1))
  const aliasKey = ALIAS_MAP.get(foodKey);
  if (aliasKey && FOOD_DB[aliasKey]) return { key: aliasKey, data: FOOD_DB[aliasKey] };

  // 3. Pluralization: strip trailing 's', 'es'
  const depluralized = foodKey.replace(/(ies)$/, "y").replace(/(es|s)$/, "");
  if (FOOD_DB[depluralized]) return { key: depluralized, data: FOOD_DB[depluralized] };
  const depluralAlias = ALIAS_MAP.get(depluralized);
  if (depluralAlias && FOOD_DB[depluralAlias]) return { key: depluralAlias, data: FOOD_DB[depluralAlias] };

  // 4. Strip common prefixes: "plate", "cup", "bowl", "piece"
  const stripped = foodKey.replace(/^(plates?\s+|cups?\s+|bowls?\s+|servings?\s+|pieces?\s+)/i, "").trim();
  if (stripped !== foodKey) {
    const result = lookupLocal(stripped);
    if (result) return result;
  }

  // 5. Partial match (last resort — for multi-word keys)
  for (const [key, val] of Object.entries(FOOD_DB)) {
    if (foodKey.includes(key) || key.includes(foodKey)) {
      return { key, data: val };
    }
  }

  return null;
}

// ─── STEP 3: Calculate macros (the core formula) ─────────────────
function calcFromDb(
  data: FoodEntry,
  grams: number | null,
  count: number | null
): { calories: number; protein: number; carbs: number; fats: number; fiber: number; quantity: string; debug: string } {

  let totalGrams: number;
  let quantityLabel: string;
  let debugTrace: string;

  if (grams !== null) {
    // User specified grams/ml directly
    totalGrams = grams;
    quantityLabel = `${grams}g`;
    debugTrace = `[GRAMS] input=${grams}g`;
  } else if (count !== null) {
    // User specified count → multiply by weightPerUnit
    if (!data.weightPerUnit || data.weightPerUnit <= 0) {
      console.error(`[NutritionEngine] weightPerUnit missing for food with defaultUnit=${data.defaultUnit}`);
      totalGrams = 100 * count;
      debugTrace = `[ERROR] weightPerUnit missing, assumed 100g × ${count}`;
    } else {
      totalGrams = data.weightPerUnit * count;
      debugTrace = `[COUNT] ${count} × ${data.weightPerUnit}g/unit = ${totalGrams}g`;
    }
    quantityLabel = `${count} × ${data.servingLabel}`;
  } else {
    totalGrams = data.weightPerUnit || 100;
    quantityLabel = data.servingLabel;
    debugTrace = `[DEFAULT] 1 serving = ${totalGrams}g`;
  }

  // Core formula: (totalGrams / 100) × per_100g_value
  const multiplier = totalGrams / 100;

  const result = {
    calories: Math.round(data.cal * multiplier),
    protein: Math.round(data.pro * multiplier * 10) / 10,
    carbs: Math.round(data.carb * multiplier * 10) / 10,
    fats: Math.round(data.fat * multiplier * 10) / 10,
    fiber: Math.round(data.fib * multiplier * 10) / 10,
    quantity: quantityLabel,
    debug: `${debugTrace} | multiplier=${multiplier.toFixed(2)} | cal=${data.cal}/100g → ${Math.round(data.cal * multiplier)}kcal`,
  };

  // Validation: sanity check
  if (result.calories < 0 || result.calories > 5000) {
    console.warn(`[NutritionEngine] Suspicious calorie value: ${result.calories} for ${totalGrams}g. ${debugTrace}`);
  }

  return result;
}

// ─── AI Lookup (unchanged) ───────────────────────────────────────
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
            content: `You are a nutrition database. Given a food item and quantity, return accurate nutritional estimates in JSON: {"calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number, "quantity": "description"}. All macro values in grams, calories in kcal. Use USDA or Indian food composition data (NIN/IFCT). For combined items (e.g. "rice and sambar"), sum all components. Be precise — a single idli is ~52 kcal, one egg is ~78 kcal, 1 cup rice is ~195 kcal.`,
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
    console.error("[NutritionEngine] OpenAI lookup failed:", err);
  }

  return null;
}

// ─── Compound lookup (rice and dal, etc.) ────────────────────────
function lookupCompoundLocal(input: string): NutritionResult | null {
  const parts = input
    .toLowerCase()
    .split(/\s+and\s+|\s+with\s+|\s*&\s*|\s*,\s*/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (parts.length === 0) return null;

  let totalCal = 0, totalPro = 0, totalCarb = 0, totalFat = 0, totalFib = 0;
  const quantityParts: string[] = [];
  const debugParts: string[] = [];
  let matchCount = 0;

  for (const part of parts) {
    const parsed = parseInput(part);
    const match = lookupLocal(parsed.foodKey);
    if (match) {
      const result = calcFromDb(match.data, parsed.grams, parsed.count);
      totalCal += result.calories;
      totalPro += result.protein;
      totalCarb += result.carbs;
      totalFat += result.fats;
      totalFib += result.fiber;
      quantityParts.push(result.quantity);
      debugParts.push(`${match.key}: ${result.debug}`);
      matchCount++;
    }
  }

  if (matchCount === 0) return null;

  return {
    foodName: input.trim(),
    quantity: quantityParts.join(" + "),
    calories: totalCal,
    protein: Math.round(totalPro),
    carbs: Math.round(totalCarb),
    fats: Math.round(totalFat),
    fiber: Math.round(totalFib),
    source: "database",
    debug: debugParts.join(" | "),
  };
}

// ─── MAIN ENTRY POINT ───────────────────────────────────────────
export async function lookupNutrition(input: string): Promise<NutritionResult> {
  const parsed = parseInput(input);

  console.log(`[NutritionEngine] Input: "${input}" → parsed:`, {
    grams: parsed.grams,
    count: parsed.count,
    foodKey: parsed.foodKey,
    isComplex: parsed.isComplex,
  });

  // Complex queries (with "and", "with") → try local compound first, then AI
  if (parsed.isComplex) {
    // Try local compound first (faster & free)
    const compoundResult = lookupCompoundLocal(input);
    if (compoundResult) {
      console.log(`[NutritionEngine] Compound match:`, compoundResult.debug);
      return compoundResult;
    }

    // Fall back to AI
    const aiResult = await lookupViaAI(input, parsed.originalName);
    if (aiResult) return aiResult;
  }

  // Try local database for simple queries
  if (!parsed.isComplex) {
    const match = lookupLocal(parsed.foodKey);
    if (match) {
      const result = calcFromDb(match.data, parsed.grams, parsed.count);
      console.log(`[NutritionEngine] DB match: ${match.key} → ${result.debug}`);
      return {
        foodName: parsed.originalName,
        quantity: result.quantity,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fats: result.fats,
        fiber: result.fiber,
        source: "database",
        debug: result.debug,
      };
    }
  }

  // Try AI for unrecognized single foods
  const aiResult = await lookupViaAI(input, parsed.originalName);
  if (aiResult) return aiResult;

  // No match found — throw so the UI can show an error
  console.warn(`[NutritionEngine] No match found for "${input}"`);
  throw new Error(`Could not find nutritional data for "${parsed.originalName}". Try rephrasing or being more specific.`);
}
