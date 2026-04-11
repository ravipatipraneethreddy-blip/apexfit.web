/**
 * TDEE Calculator using Mifflin-St Jeor Equation
 *
 * BMR (Male):   10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5
 * BMR (Female): 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
 */

type TDEEInput = {
  weight: number;      // kg
  height: number;      // cm
  age: number;
  gender: string;      // MALE or FEMALE
  activityLevel: string;
  goal: string;        // FAT_LOSS, MUSCLE_GAIN, RECOMP
  overrideCalories?: number; // allow custom calorie input
};

type TDEEResult = {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;     // grams
  carbs: number;       // grams
  fats: number;        // grams
};

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  FAT_LOSS: -500,
  MUSCLE_GAIN: 300,
  RECOMP: -100,
};

export function calculateTDEE(input: TDEEInput): TDEEResult {
  const { weight, height, age, gender, activityLevel, goal, overrideCalories } = input;

  // 1. Calculate BMR (Mifflin-St Jeor)
  const bmr =
    gender === "FEMALE"
      ? 10 * weight + 6.25 * height - 5 * age - 161
      : 10 * weight + 6.25 * height - 5 * age + 5;

  // 2. Apply activity multiplier
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  const tdee = Math.round(bmr * multiplier);

  // 3. Apply goal adjustment
  let calories;
  if (overrideCalories && overrideCalories > 0) {
    calories = overrideCalories;
  } else {
    const adjustment = GOAL_ADJUSTMENTS[goal] ?? 0;
    calories = Math.round(tdee + adjustment);
  }

  // 4. Derive macros
  const protein = Math.round(weight * 2);               // 2g per kg
  const fatsCalories = calories * 0.25;                  // 25% from fats
  const fats = Math.round(fatsCalories / 9);             // 9 cal per g fat
  const proteinCalories = protein * 4;                   // 4 cal per g protein
  const carbsCalories = calories - proteinCalories - fatsCalories;
  const carbs = Math.round(Math.max(carbsCalories / 4, 50)); // min 50g carbs

  return { bmr: Math.round(bmr), tdee, calories, protein, carbs, fats };
}
