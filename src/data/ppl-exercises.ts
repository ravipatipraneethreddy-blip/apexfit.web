// Workout split exercise data with YouTube video links
// Each exercise has a curated YouTube video demonstrating proper form
// Splits: Push, Pull, Legs, Upper Body, Lower Body, Full Body

export type SplitCategory = "push" | "pull" | "legs" | "upper" | "lower" | "fullbody";

export interface SplitExercise {
  id: string;
  name: string;
  category: SplitCategory;
  muscleGroup: string;
  equipment: string;
  sets: string;
  reps: string;
  youtubeId: string;          // YouTube video ID for embedding
  tips: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

export const SPLIT_EXERCISES: SplitExercise[] = [
  // ═══════════════════════════════════════════════════════════
  //  PUSH DAY — Chest, Shoulders, Triceps
  // ═══════════════════════════════════════════════════════════

  // ─── Chest ─────────────────────────────────────────────────
  {
    id: "ppl-push-01",
    name: "Barbell Bench Press",
    category: "push",
    muscleGroup: "Chest",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "rT7DgCr-3pg",
    tips: [
      "Retract and depress your scapulae before unracking",
      "Keep your feet flat on the floor",
      "Lower the bar to your mid-chest with control",
      "Drive through the heels of your palms"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-push-02",
    name: "Incline Dumbbell Press",
    category: "push",
    muscleGroup: "Upper Chest",
    equipment: "Dumbbells",
    sets: "3",
    reps: "8-12",
    youtubeId: "8iPEnn-ltC8",
    tips: [
      "Set the bench to 30–45 degrees",
      "Press dumbbells up and slightly inward",
      "Don't bounce at the bottom"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-push-03",
    name: "Cable Crossover",
    category: "push",
    muscleGroup: "Chest",
    equipment: "Cable Machine",
    sets: "3",
    reps: "12-15",
    youtubeId: "taI4XduLpTk",
    tips: [
      "Step forward slightly for a good stretch",
      "Cross hands at the bottom for peak contraction",
      "Control the eccentric — don't let the weight snap back"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-push-04",
    name: "Push-Up",
    category: "push",
    muscleGroup: "Chest",
    equipment: "Bodyweight",
    sets: "3",
    reps: "15-20",
    youtubeId: "IODxDxX7oi4",
    tips: [
      "Keep your body in a straight line",
      "Hands slightly wider than shoulder-width",
      "Full range of motion — chest to floor, elbows locked out"
    ],
    difficulty: "Beginner",
  },

  // ─── Shoulders ─────────────────────────────────────────────
  {
    id: "ppl-push-05",
    name: "Overhead Press",
    category: "push",
    muscleGroup: "Shoulders",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "2yjwXTZQDDI",
    tips: [
      "Brace your core and squeeze your glutes",
      "Press the bar just slightly in front of your head",
      "Lock out at the top with the bar over midfoot"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-push-06",
    name: "Dumbbell Lateral Raise",
    category: "push",
    muscleGroup: "Shoulders",
    equipment: "Dumbbells",
    sets: "4",
    reps: "12-15",
    youtubeId: "3VcKaXpzqRo",
    tips: [
      "Lead with your elbows, not your hands",
      "Raise to shoulder height — no higher",
      "Use a controlled tempo for maximum tension"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-push-07",
    name: "Arnold Press",
    category: "push",
    muscleGroup: "Shoulders",
    equipment: "Dumbbells",
    sets: "3",
    reps: "10-12",
    youtubeId: "6Z15_WdXmVw",
    tips: [
      "Start with palms facing you at the bottom",
      "Rotate as you press — palms face forward at the top",
      "Smooth, continuous motion throughout"
    ],
    difficulty: "Intermediate",
  },

  // ─── Triceps ───────────────────────────────────────────────
  {
    id: "ppl-push-08",
    name: "Cable Tricep Pushdown",
    category: "push",
    muscleGroup: "Triceps",
    equipment: "Cable Machine",
    sets: "3",
    reps: "12-15",
    youtubeId: "2-LAMcpzODU",
    tips: [
      "Pin elbows to your sides — no flaring",
      "Squeeze hard at the bottom, full extension",
      "Controlled eccentric on the way up"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-push-09",
    name: "Skull Crusher",
    category: "push",
    muscleGroup: "Triceps",
    equipment: "EZ Bar",
    sets: "3",
    reps: "10-12",
    youtubeId: "d_KZxkY_0cM",
    tips: [
      "Lower the bar to your forehead or slightly behind",
      "Keep upper arms vertical — only forearms move",
      "Use a slight backward angle for constant tension"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-push-10",
    name: "Overhead Tricep Extension",
    category: "push",
    muscleGroup: "Triceps",
    equipment: "Dumbbell",
    sets: "3",
    reps: "10-12",
    youtubeId: "YbX7Wd8jQ-Q",
    tips: [
      "Hold one dumbbell with both hands behind your head",
      "Keep elbows pointing towards the ceiling",
      "Fully extend at the top"
    ],
    difficulty: "Beginner",
  },

  // ═══════════════════════════════════════════════════════════
  //  PULL DAY — Back, Biceps, Rear Delts
  // ═══════════════════════════════════════════════════════════

  // ─── Back ──────────────────────────────────────────────────
  {
    id: "ppl-pull-01",
    name: "Barbell Bent-Over Row",
    category: "pull",
    muscleGroup: "Back",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "FWJR5Ve8bnQ",
    tips: [
      "Hinge at the hips — torso at ~45 degrees",
      "Pull the bar to your lower chest/upper abdomen",
      "Squeeze your shoulder blades at the top"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-pull-02",
    name: "Pull-Up",
    category: "pull",
    muscleGroup: "Back",
    equipment: "Bodyweight",
    sets: "4",
    reps: "6-10",
    youtubeId: "eGo4IYlbE5g",
    tips: [
      "Grip slightly wider than shoulder-width",
      "Initiate by pulling your elbows down",
      "Go all the way down for full stretch"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-pull-03",
    name: "Lat Pulldown",
    category: "pull",
    muscleGroup: "Back",
    equipment: "Cable Machine",
    sets: "3",
    reps: "10-12",
    youtubeId: "CAwf7n6Luuc",
    tips: [
      "Lean back slightly and pull to your upper chest",
      "Drive elbows down and back",
      "Don't swing or use momentum"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-pull-04",
    name: "Seated Cable Row",
    category: "pull",
    muscleGroup: "Back",
    equipment: "Cable Machine",
    sets: "3",
    reps: "10-12",
    youtubeId: "GZbfZ033f74",
    tips: [
      "Keep your back straight throughout",
      "Pull the handle to your abdomen",
      "Squeeze shoulder blades together"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-pull-05",
    name: "Deadlift",
    category: "pull",
    muscleGroup: "Back / Posterior Chain",
    equipment: "Barbell",
    sets: "3",
    reps: "5",
    youtubeId: "op9kVnSso6Q",
    tips: [
      "Bar over mid-foot, shoulder-width stance",
      "Flat back — hinge at the hips",
      "Drive through the floor, lock out at the top",
      "Reset each rep from the floor"
    ],
    difficulty: "Advanced",
  },

  // ─── Biceps ────────────────────────────────────────────────
  {
    id: "ppl-pull-06",
    name: "Barbell Curl",
    category: "pull",
    muscleGroup: "Biceps",
    equipment: "Barbell",
    sets: "3",
    reps: "10-12",
    youtubeId: "ykJmrZ5v0Oo",
    tips: [
      "Keep elbows pinned at your sides",
      "Squeeze hard at the top",
      "Control the negative — don't swing"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-pull-07",
    name: "Dumbbell Hammer Curl",
    category: "pull",
    muscleGroup: "Biceps / Brachialis",
    equipment: "Dumbbells",
    sets: "3",
    reps: "10-12",
    youtubeId: "zC3nLlEvin4",
    tips: [
      "Palms face each other throughout",
      "Alternate or curl both simultaneously",
      "Great for building arm thickness"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-pull-08",
    name: "Face Pull",
    category: "pull",
    muscleGroup: "Rear Delts / Upper Back",
    equipment: "Cable Machine",
    sets: "4",
    reps: "15-20",
    youtubeId: "rep-qVOkqgk",
    tips: [
      "Set the cable at upper chest height",
      "Pull the rope to your face, separating the ends",
      "Externally rotate at the top for shoulder health"
    ],
    difficulty: "Beginner",
  },

  // ═══════════════════════════════════════════════════════════
  //  LEG DAY — Quads, Hamstrings, Glutes, Calves
  // ═══════════════════════════════════════════════════════════

  {
    id: "ppl-legs-01",
    name: "Barbell Back Squat",
    category: "legs",
    muscleGroup: "Quads / Glutes",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "bEv6CCg2BC8",
    tips: [
      "Feet shoulder-width apart, toes slightly out",
      "Break at the hips and knees simultaneously",
      "Go at least to parallel — deeper if mobility allows",
      "Drive through your whole foot"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-legs-02",
    name: "Leg Press",
    category: "legs",
    muscleGroup: "Quads",
    equipment: "Sled Machine",
    sets: "4",
    reps: "10-12",
    youtubeId: "IZxyjW7MPJQ",
    tips: [
      "Place feet shoulder-width on the platform",
      "Don't let your lower back round at the bottom",
      "Don't lock out knees at the top"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-legs-03",
    name: "Bulgarian Split Squat",
    category: "legs",
    muscleGroup: "Quads / Glutes",
    equipment: "Dumbbells",
    sets: "3",
    reps: "10-12 per leg",
    youtubeId: "2C-uNgKwPLE",
    tips: [
      "Elevate rear foot on a bench",
      "Keep torso upright",
      "Front knee tracks over your toes"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-legs-04",
    name: "Leg Extension",
    category: "legs",
    muscleGroup: "Quads",
    equipment: "Machine",
    sets: "3",
    reps: "12-15",
    youtubeId: "YyvSfVjQeL0",
    tips: [
      "Squeeze hard at the top for peak contraction",
      "Control the negative — don't drop the weight",
      "Adjust the pad to sit just above your ankles"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-legs-05",
    name: "Romanian Deadlift",
    category: "legs",
    muscleGroup: "Hamstrings / Glutes",
    equipment: "Barbell",
    sets: "4",
    reps: "8-10",
    youtubeId: "7j-2w4-P14I",
    tips: [
      "Keep the bar close to your body the whole time",
      "Push your hips back — soft bend in the knees",
      "Feel a deep stretch in the hamstrings",
      "Hinge until you feel the stretch, then drive hips forward"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-legs-06",
    name: "Lying Leg Curl",
    category: "legs",
    muscleGroup: "Hamstrings",
    equipment: "Machine",
    sets: "3",
    reps: "10-12",
    youtubeId: "1Tq3QdYUuHs",
    tips: [
      "Keep your hips pressed into the pad",
      "Curl the weight all the way up",
      "Slow eccentric for maximum muscle damage"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-legs-07",
    name: "Hip Thrust",
    category: "legs",
    muscleGroup: "Glutes",
    equipment: "Barbell",
    sets: "4",
    reps: "10-12",
    youtubeId: "xDmFkJxPzeM",
    tips: [
      "Upper back on the bench, feet flat on the floor",
      "Drive through your heels and squeeze glutes hard at the top",
      "Full lockout at the top — hips fully extended"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "ppl-legs-08",
    name: "Walking Lunge",
    category: "legs",
    muscleGroup: "Quads / Glutes",
    equipment: "Dumbbells",
    sets: "3",
    reps: "12-16 steps",
    youtubeId: "D7KaRcUTQeA",
    tips: [
      "Take long strides for more glute activation",
      "Keep torso upright throughout",
      "Back knee nearly touches the ground each rep"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-legs-09",
    name: "Standing Calf Raise",
    category: "legs",
    muscleGroup: "Calves",
    equipment: "Machine",
    sets: "4",
    reps: "15-20",
    youtubeId: "gwLzBJYoWlI",
    tips: [
      "Full range of motion — deep stretch at the bottom",
      "Pause and squeeze at the top",
      "Slow and controlled — no bouncing"
    ],
    difficulty: "Beginner",
  },
  {
    id: "ppl-legs-10",
    name: "Seated Calf Raise",
    category: "legs",
    muscleGroup: "Calves (Soleus)",
    equipment: "Machine",
    sets: "3",
    reps: "15-20",
    youtubeId: "JbyjNymZOt0",
    tips: [
      "Targets the soleus — important for overall calf size",
      "Full stretch at the bottom, squeeze at the top",
      "Hold the contraction for 1-2 seconds"
    ],
    difficulty: "Beginner",
  },

  // ═══════════════════════════════════════════════════════════
  //  UPPER BODY — Chest, Back, Shoulders, Arms
  //  Science-based: horizontal + vertical push/pull balance
  // ═══════════════════════════════════════════════════════════

  {
    id: "upper-01",
    name: "Barbell Bench Press",
    category: "upper",
    muscleGroup: "Chest",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "rT7DgCr-3pg",
    tips: [
      "Arch your upper back slightly for scapular stability",
      "Touch the bar to mid-chest — no bouncing",
      "Full lockout at the top on every rep"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "upper-02",
    name: "Barbell Bent-Over Row",
    category: "upper",
    muscleGroup: "Back",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "FWJR5Ve8bnQ",
    tips: [
      "Maintain a flat back and ~45° torso angle",
      "Row to your lower chest, not your belly button",
      "Squeeze scapulae together at peak contraction"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "upper-03",
    name: "Seated Dumbbell Overhead Press",
    category: "upper",
    muscleGroup: "Shoulders",
    equipment: "Dumbbells",
    sets: "3",
    reps: "8-10",
    youtubeId: "qEwKCR5JCog",
    tips: [
      "Sit upright — don't lean back excessively",
      "Press to full lockout above your head",
      "Lower until upper arms are parallel to the floor"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "upper-04",
    name: "Lat Pulldown",
    category: "upper",
    muscleGroup: "Lats / Upper Back",
    equipment: "Cable Machine",
    sets: "3",
    reps: "10-12",
    youtubeId: "CAwf7n6Luuc",
    tips: [
      "Lean back slightly — pull to upper chest",
      "Initiate the pull with your lats, not your arms",
      "Slow and controlled eccentric phase"
    ],
    difficulty: "Beginner",
  },
  {
    id: "upper-05",
    name: "Incline Dumbbell Press",
    category: "upper",
    muscleGroup: "Upper Chest",
    equipment: "Dumbbells",
    sets: "3",
    reps: "10-12",
    youtubeId: "8iPEnn-ltC8",
    tips: [
      "30–45° incline targets the clavicular pectorals",
      "Keep wrists neutral and stacked above elbows",
      "Full stretch at the bottom, squeeze at the top"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "upper-06",
    name: "Cable Face Pull",
    category: "upper",
    muscleGroup: "Rear Delts / Rotator Cuff",
    equipment: "Cable Machine",
    sets: "3",
    reps: "15-20",
    youtubeId: "rep-qVOkqgk",
    tips: [
      "Essential for shoulder health and posture",
      "Pull to your forehead and externally rotate",
      "Squeeze your rear delts at the end of each rep"
    ],
    difficulty: "Beginner",
  },
  {
    id: "upper-07",
    name: "Dumbbell Lateral Raise",
    category: "upper",
    muscleGroup: "Side Delts",
    equipment: "Dumbbells",
    sets: "3",
    reps: "12-15",
    youtubeId: "3VcKaXpzqRo",
    tips: [
      "Slight forward lean to target the lateral head",
      "Lead with your elbows, pinky up slightly",
      "Don't go above shoulder height"
    ],
    difficulty: "Beginner",
  },
  {
    id: "upper-08",
    name: "Barbell Curl",
    category: "upper",
    muscleGroup: "Biceps",
    equipment: "Barbell",
    sets: "3",
    reps: "10-12",
    youtubeId: "ykJmrZ5v0Oo",
    tips: [
      "Pin your elbows — no swinging",
      "Full extension at the bottom, squeeze at the top",
      "Use a weight you can control for 10+ reps"
    ],
    difficulty: "Beginner",
  },
  {
    id: "upper-09",
    name: "Overhead Tricep Extension",
    category: "upper",
    muscleGroup: "Triceps (Long Head)",
    equipment: "Cable / Dumbbell",
    sets: "3",
    reps: "10-12",
    youtubeId: "YbX7Wd8jQ-Q",
    tips: [
      "Stretching the long head overhead maximizes growth (Schoenfeld 2022)",
      "Keep elbows stable and pointing up",
      "Full stretch at the bottom of each rep"
    ],
    difficulty: "Beginner",
  },
  {
    id: "upper-10",
    name: "Dumbbell Hammer Curl",
    category: "upper",
    muscleGroup: "Biceps / Brachioradialis",
    equipment: "Dumbbells",
    sets: "3",
    reps: "10-12",
    youtubeId: "zC3nLlEvin4",
    tips: [
      "Neutral grip targets the brachialis and forearms",
      "Builds arm width more than regular curls",
      "Keep the tempo slow and controlled"
    ],
    difficulty: "Beginner",
  },

  // ═══════════════════════════════════════════════════════════
  //  LOWER BODY — Quads, Hamstrings, Glutes, Calves, Core
  //  Science-based: quad-dominant, hip-dominant, isolation
  // ═══════════════════════════════════════════════════════════

  {
    id: "lower-01",
    name: "Barbell Back Squat",
    category: "lower",
    muscleGroup: "Quads / Glutes",
    equipment: "Barbell",
    sets: "4",
    reps: "5-8",
    youtubeId: "bEv6CCg2BC8",
    tips: [
      "The king of lower body exercises — high EMG activation across all leg muscles",
      "Brace your core hard before descending",
      "Break at hips and knees simultaneously",
      "Drive up through your whole foot"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "lower-02",
    name: "Romanian Deadlift",
    category: "lower",
    muscleGroup: "Hamstrings / Glutes",
    equipment: "Barbell",
    sets: "4",
    reps: "8-10",
    youtubeId: "7j-2w4-P14I",
    tips: [
      "The best hamstring exercise per EMG research",
      "Hinge at hips, keep the bar glued to your legs",
      "Deep stretch at bottom — drive hips forward to finish"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "lower-03",
    name: "Bulgarian Split Squat",
    category: "lower",
    muscleGroup: "Quads / Glutes",
    equipment: "Dumbbells",
    sets: "3",
    reps: "8-12 per leg",
    youtubeId: "2C-uNgKwPLE",
    tips: [
      "Fixes imbalances between left and right legs",
      "Lean forward slightly to target glutes more",
      "Stand upright for more quad emphasis"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "lower-04",
    name: "Leg Press",
    category: "lower",
    muscleGroup: "Quads",
    equipment: "Machine",
    sets: "3",
    reps: "10-12",
    youtubeId: "IZxyjW7MPJQ",
    tips: [
      "Feet low and narrow = more quads. High and wide = more glutes",
      "Full range of motion — deep stretch at the bottom",
      "Don't lock out knees at the top"
    ],
    difficulty: "Beginner",
  },
  {
    id: "lower-05",
    name: "Hip Thrust",
    category: "lower",
    muscleGroup: "Glutes",
    equipment: "Barbell",
    sets: "4",
    reps: "10-12",
    youtubeId: "xDmFkJxPzeM",
    tips: [
      "Highest glute activation of any exercise (Contreras et al.)",
      "Drive through heels, full hip extension at top",
      "Posterior pelvic tilt at lockout for peak squeeze"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "lower-06",
    name: "Lying Leg Curl",
    category: "lower",
    muscleGroup: "Hamstrings",
    equipment: "Machine",
    sets: "3",
    reps: "10-12",
    youtubeId: "1Tq3QdYUuHs",
    tips: [
      "Isolates the hamstrings — especially important for knee health",
      "Control the eccentric for maximum time under tension",
      "Point toes away from you for more hamstring activation"
    ],
    difficulty: "Beginner",
  },
  {
    id: "lower-07",
    name: "Leg Extension",
    category: "lower",
    muscleGroup: "Quads",
    equipment: "Machine",
    sets: "3",
    reps: "12-15",
    youtubeId: "YyvSfVjQeL0",
    tips: [
      "Isolates the quadriceps — great finisher",
      "Hold the contraction at the top for 1–2 seconds",
      "Studies show it's safe for knees when done with control"
    ],
    difficulty: "Beginner",
  },
  {
    id: "lower-08",
    name: "Walking Lunge",
    category: "lower",
    muscleGroup: "Quads / Glutes",
    equipment: "Dumbbells",
    sets: "3",
    reps: "12-16 steps",
    youtubeId: "D7KaRcUTQeA",
    tips: [
      "Long strides emphasize glutes, short strides target quads",
      "Keep torso upright and core braced",
      "Back knee nearly touches the floor each step"
    ],
    difficulty: "Beginner",
  },
  {
    id: "lower-09",
    name: "Standing Calf Raise",
    category: "lower",
    muscleGroup: "Calves (Gastrocnemius)",
    equipment: "Machine",
    sets: "4",
    reps: "12-15",
    youtubeId: "gwLzBJYoWlI",
    tips: [
      "Straight legs target the gastrocnemius (outer calf)",
      "Full stretch at the bottom — pause at the top",
      "Higher frequency training (3x/week) is key for calf growth"
    ],
    difficulty: "Beginner",
  },
  {
    id: "lower-10",
    name: "Seated Calf Raise",
    category: "lower",
    muscleGroup: "Calves (Soleus)",
    equipment: "Machine",
    sets: "3",
    reps: "15-20",
    youtubeId: "JbyjNymZOt0",
    tips: [
      "Bent knees shift emphasis to the soleus (inner calf)",
      "The soleus makes up ~60% of calf mass — don't skip this",
      "High reps and a slow eccentric work best"
    ],
    difficulty: "Beginner",
  },

  // ═══════════════════════════════════════════════════════════
  //  FULL BODY — Best compound movements hitting everything
  //  Science-based: efficient, high-frequency training
  // ═══════════════════════════════════════════════════════════

  {
    id: "fb-01",
    name: "Barbell Back Squat",
    category: "fullbody",
    muscleGroup: "Quads / Glutes / Core",
    equipment: "Barbell",
    sets: "4",
    reps: "5-8",
    youtubeId: "bEv6CCg2BC8",
    tips: [
      "Best overall lower body developer",
      "Activates quads, glutes, hamstrings, core, and spinal erectors",
      "Full depth squat = more muscle activation (study: Hartmann et al.)"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "fb-02",
    name: "Barbell Bench Press",
    category: "fullbody",
    muscleGroup: "Chest / Triceps / Front Delts",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "rT7DgCr-3pg",
    tips: [
      "The gold standard for chest development",
      "Arch upper back, retract scapulae, feet planted",
      "Touch the bar to mid-chest — full range of motion"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "fb-03",
    name: "Barbell Bent-Over Row",
    category: "fullbody",
    muscleGroup: "Back / Biceps / Rear Delts",
    equipment: "Barbell",
    sets: "4",
    reps: "6-8",
    youtubeId: "FWJR5Ve8bnQ",
    tips: [
      "Horizontal pull to balance horizontal push (bench press)",
      "Pull to lower chest for optimal lat and trap activation",
      "Maintain a rigid torso throughout"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "fb-04",
    name: "Overhead Press",
    category: "fullbody",
    muscleGroup: "Shoulders / Triceps / Core",
    equipment: "Barbell",
    sets: "3",
    reps: "6-8",
    youtubeId: "2yjwXTZQDDI",
    tips: [
      "The best compound shoulder exercise",
      "Brace your core — it's basically a standing plank",
      "Press in a slight arc around your face"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "fb-05",
    name: "Deadlift",
    category: "fullbody",
    muscleGroup: "Full Posterior Chain",
    equipment: "Barbell",
    sets: "3",
    reps: "5",
    youtubeId: "op9kVnSso6Q",
    tips: [
      "Recruits more total muscle mass than any other exercise",
      "Targets glutes, hamstrings, erectors, lats, traps, grip",
      "Keep the bar touching your legs throughout the pull"
    ],
    difficulty: "Advanced",
  },
  {
    id: "fb-06",
    name: "Pull-Up",
    category: "fullbody",
    muscleGroup: "Lats / Biceps / Core",
    equipment: "Bodyweight",
    sets: "3",
    reps: "6-10",
    youtubeId: "eGo4IYlbE5g",
    tips: [
      "The king of vertical pulls — builds v-taper",
      "Dead hang at the bottom for full lat stretch",
      "Add weight with a belt once bodyweight feels easy"
    ],
    difficulty: "Intermediate",
  },
  {
    id: "fb-07",
    name: "Dumbbell Romanian Deadlift",
    category: "fullbody",
    muscleGroup: "Hamstrings / Glutes",
    equipment: "Dumbbells",
    sets: "3",
    reps: "10-12",
    youtubeId: "7j-2w4-P14I",
    tips: [
      "Essential hamstring exercise for injury prevention",
      "Dumbbells allow a more natural grip and range of motion",
      "Feel the stretch — don't rush the eccentric"
    ],
    difficulty: "Beginner",
  },
  {
    id: "fb-08",
    name: "Dumbbell Lateral Raise",
    category: "fullbody",
    muscleGroup: "Side Delts",
    equipment: "Dumbbells",
    sets: "3",
    reps: "12-15",
    youtubeId: "3VcKaXpzqRo",
    tips: [
      "Lateral delts need isolation — compounds don't hit them enough",
      "Use lighter weight with perfect form",
      "Lead with elbows, slight forward lean"
    ],
    difficulty: "Beginner",
  },
  {
    id: "fb-09",
    name: "Cable Face Pull",
    category: "fullbody",
    muscleGroup: "Rear Delts / Rotator Cuff",
    equipment: "Cable Machine",
    sets: "3",
    reps: "15-20",
    youtubeId: "rep-qVOkqgk",
    tips: [
      "Non-negotiable for shoulder health — do them every session",
      "External rotation at the top activates the rotator cuff",
      "Light weight, high reps — it's a health exercise, not an ego lift"
    ],
    difficulty: "Beginner",
  },
  {
    id: "fb-10",
    name: "Barbell Curl",
    category: "fullbody",
    muscleGroup: "Biceps",
    equipment: "Barbell / EZ Bar",
    sets: "2",
    reps: "10-12",
    youtubeId: "ykJmrZ5v0Oo",
    tips: [
      "Direct bicep work for arm growth",
      "EZ bar reduces wrist strain — use it if straight bar hurts",
      "Control the eccentric for maximum muscle fiber recruitment"
    ],
    difficulty: "Beginner",
  },
  {
    id: "fb-11",
    name: "Cable Tricep Pushdown",
    category: "fullbody",
    muscleGroup: "Triceps",
    equipment: "Cable Machine",
    sets: "2",
    reps: "12-15",
    youtubeId: "2-LAMcpzODU",
    tips: [
      "Triceps make up 2/3 of arm size — don't neglect them",
      "Pin elbows at your sides for strict form",
      "Squeeze hard at full extension"
    ],
    difficulty: "Beginner",
  },
  {
    id: "fb-12",
    name: "Plank",
    category: "fullbody",
    muscleGroup: "Core / Stabilizers",
    equipment: "Bodyweight",
    sets: "3",
    reps: "30-60 sec",
    youtubeId: "ASdvN_XEl_c",
    tips: [
      "Anti-extension exercise — teaches core bracing for all big lifts",
      "Squeeze everything: abs, glutes, quads",
      "Don't let your hips sag or pike up"
    ],
    difficulty: "Beginner",
  },
];

// Category metadata for display
export const SPLIT_CATEGORIES = {
  push: {
    label: "Push",
    tagline: "Chest • Shoulders • Triceps",
    color: "from-red-500 to-orange-500",
    textColor: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    glowColor: "shadow-[0_0_20px_rgba(251,146,60,0.3)]",
    icon: "💪",
    description: "Build a powerful pressing foundation. Push day targets your chest, shoulders, and triceps with compound and isolation movements.",
    frequency: "2x per week in a 6-day PPL split"
  },
  pull: {
    label: "Pull",
    tagline: "Back • Biceps • Rear Delts",
    color: "from-blue-500 to-cyan-500",
    textColor: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/20",
    glowColor: "shadow-[0_0_20px_rgba(34,211,238,0.3)]",
    icon: "🔗",
    description: "Develop a thick, wide back and strong biceps. Pull day focuses on all pulling movements for a balanced physique.",
    frequency: "2x per week in a 6-day PPL split"
  },
  legs: {
    label: "Legs",
    tagline: "Quads • Hamstrings • Glutes • Calves",
    color: "from-emerald-500 to-green-500",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/20",
    glowColor: "shadow-[0_0_20px_rgba(52,211,153,0.3)]",
    icon: "🦵",
    description: "Build tree-trunk legs. Leg day hammers your quads, hamstrings, glutes, and calves for total lower body development.",
    frequency: "2x per week in a 6-day PPL split"
  },
  upper: {
    label: "Upper Body",
    tagline: "Chest • Back • Shoulders • Arms",
    color: "from-violet-500 to-purple-500",
    textColor: "text-violet-400",
    bgColor: "bg-violet-400/10",
    borderColor: "border-violet-400/20",
    glowColor: "shadow-[0_0_20px_rgba(167,139,250,0.3)]",
    icon: "🏋️",
    description: "Hit every upper body muscle in one session. Balances horizontal and vertical push/pull movements for complete upper body development.",
    frequency: "2x per week in a 4-day Upper/Lower split"
  },
  lower: {
    label: "Lower Body",
    tagline: "Quads • Hamstrings • Glutes • Calves",
    color: "from-amber-500 to-yellow-500",
    textColor: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/20",
    glowColor: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
    icon: "🦿",
    description: "Dedicated lower body day with quad-dominant, hip-dominant, and isolation exercises. Science-backed programming for maximum leg growth.",
    frequency: "2x per week in a 4-day Upper/Lower split"
  },
  fullbody: {
    label: "Full Body",
    tagline: "All Major Muscle Groups",
    color: "from-rose-500 to-pink-500",
    textColor: "text-rose-400",
    bgColor: "bg-rose-400/10",
    borderColor: "border-rose-400/20",
    glowColor: "shadow-[0_0_20px_rgba(251,113,133,0.3)]",
    icon: "⚡",
    description: "Train everything in one session. Research shows full body training 3x/week is optimal for beginners and produces equal hypertrophy to splits in intermediates.",
    frequency: "3x per week — ideal for beginners & busy schedules"
  },
} as const;

// Backwards compatibility aliases
export type PPLCategory = SplitCategory;
export type PPLExercise = SplitExercise;
export const PPL_EXERCISES = SPLIT_EXERCISES;
export const PPL_CATEGORIES = SPLIT_CATEGORIES;
