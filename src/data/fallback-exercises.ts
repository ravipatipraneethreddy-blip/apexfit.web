// Fallback exercise data — used when the ExerciseDB API is unavailable.
// These are seeded once into the CachedExercise table.

export const FALLBACK_EXERCISES = [
  // ─── CHEST ────────────────────────────────────────────────
  {
    id: "fb-0001",
    name: "barbell bench press",
    bodyPart: "chest",
    target: "pectorals",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Lie flat on a bench with your feet on the ground.",
      "Grip the bar slightly wider than shoulder-width.",
      "Unrack the bar and lower it to your mid-chest.",
      "Press the bar back up to full extension.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["triceps", "anterior deltoids"]
  },
  {
    id: "fb-0002",
    name: "dumbbell flyes",
    bodyPart: "chest",
    target: "pectorals",
    equipment: "dumbbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Lie on a flat bench with a dumbbell in each hand.",
      "Extend your arms above your chest, palms facing each other.",
      "Lower the dumbbells in a wide arc until you feel a stretch.",
      "Squeeze your chest to bring the dumbbells back up.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["anterior deltoids"]
  },
  {
    id: "fb-0003",
    name: "incline dumbbell press",
    bodyPart: "chest",
    target: "pectorals",
    equipment: "dumbbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Set the bench to a 30-45 degree incline.",
      "Hold a dumbbell in each hand at shoulder level.",
      "Press the dumbbells up until arms are extended.",
      "Lower back to shoulder level with control.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["triceps", "anterior deltoids"]
  },
  {
    id: "fb-0004",
    name: "push-up",
    bodyPart: "chest",
    target: "pectorals",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Start in a plank position with hands slightly wider than shoulders.",
      "Keep your body in a straight line from head to heels.",
      "Lower your body until your chest nearly touches the floor.",
      "Push back up to the starting position.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["triceps", "anterior deltoids", "core"]
  },
  {
    id: "fb-0005",
    name: "cable crossover",
    bodyPart: "chest",
    target: "pectorals",
    equipment: "cable",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Set both pulleys to the highest position.",
      "Grab a handle in each hand and step forward.",
      "With a slight bend in your elbows, bring your hands together in front of you.",
      "Squeeze your chest at the bottom of the movement.",
      "Slowly return to the starting position."
    ],
    secondaryMuscles: ["anterior deltoids"]
  },

  // ─── BACK ─────────────────────────────────────────────────
  {
    id: "fb-0010",
    name: "barbell bent-over row",
    bodyPart: "back",
    target: "lats",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with feet shoulder-width apart, holding a barbell.",
      "Bend at the hips until your torso is nearly parallel to the floor.",
      "Pull the bar to your lower chest, squeezing your shoulder blades.",
      "Lower the bar back down with control.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["biceps", "rhomboids", "rear deltoids"]
  },
  {
    id: "fb-0011",
    name: "pull-up",
    bodyPart: "back",
    target: "lats",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Hang from a pull-up bar with an overhand grip, hands slightly wider than shoulders.",
      "Pull yourself up until your chin is above the bar.",
      "Lower yourself back down with control.",
      "Avoid swinging or using momentum.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["biceps", "forearms"]
  },
  {
    id: "fb-0012",
    name: "lat pulldown",
    bodyPart: "back",
    target: "lats",
    equipment: "cable",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Sit at a lat pulldown machine and grasp the bar wider than shoulder-width.",
      "Pull the bar down to your upper chest.",
      "Squeeze your lats at the bottom.",
      "Slowly return the bar to the top.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["biceps", "rear deltoids"]
  },
  {
    id: "fb-0013",
    name: "seated cable row",
    bodyPart: "back",
    target: "upper back",
    equipment: "cable",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Sit at a cable row machine with your feet on the platform.",
      "Grab the handle and sit upright.",
      "Pull the handle to your abdomen, squeezing your shoulder blades.",
      "Extend your arms back slowly.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["biceps", "lats"]
  },
  {
    id: "fb-0014",
    name: "dumbbell single-arm row",
    bodyPart: "back",
    target: "lats",
    equipment: "dumbbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Place one knee and hand on a bench for support.",
      "Hold a dumbbell in the other hand, arm hanging straight down.",
      "Pull the dumbbell to your hip, keeping your elbow close.",
      "Lower it back down with control.",
      "Repeat on both sides."
    ],
    secondaryMuscles: ["biceps", "rear deltoids"]
  },
  {
    id: "fb-0015",
    name: "deadlift",
    bodyPart: "back",
    target: "spine",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with feet hip-width apart, barbell over mid-foot.",
      "Bend at the hips and knees to grip the bar just outside your legs.",
      "Keep your back flat and chest up.",
      "Drive through your heels to stand up with the bar.",
      "Lower the bar back to the ground with control."
    ],
    secondaryMuscles: ["glutes", "hamstrings", "forearms"]
  },

  // ─── SHOULDERS ────────────────────────────────────────────
  {
    id: "fb-0020",
    name: "overhead press",
    bodyPart: "shoulders",
    target: "deltoids",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with feet shoulder-width apart, barbell at shoulder height.",
      "Press the bar overhead until arms are fully extended.",
      "Lower it back to shoulder level.",
      "Keep your core tight throughout.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["triceps", "upper chest"]
  },
  {
    id: "fb-0021",
    name: "dumbbell lateral raise",
    bodyPart: "shoulders",
    target: "deltoids",
    equipment: "dumbbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with dumbbells at your sides.",
      "Raise the dumbbells out to the sides until parallel with the floor.",
      "Keep a slight bend in your elbows.",
      "Lower back down with control.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["traps"]
  },
  {
    id: "fb-0022",
    name: "face pull",
    bodyPart: "shoulders",
    target: "rear deltoids",
    equipment: "cable",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Set a cable machine to upper chest height with a rope attachment.",
      "Pull the rope towards your face, separating the ends.",
      "Squeeze your rear delts and upper back.",
      "Return to start with control.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["traps", "rhomboids"]
  },
  {
    id: "fb-0023",
    name: "arnold press",
    bodyPart: "shoulders",
    target: "deltoids",
    equipment: "dumbbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Sit on a bench holding dumbbells at shoulder height, palms facing you.",
      "As you press the dumbbells up, rotate your wrists so palms face forward at the top.",
      "Reverse the motion as you lower the dumbbells.",
      "Keep the movement smooth and controlled.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["triceps"]
  },

  // ─── UPPER ARMS ───────────────────────────────────────────
  {
    id: "fb-0030",
    name: "barbell curl",
    bodyPart: "upper arms",
    target: "biceps",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with feet shoulder-width apart holding a barbell, palms up.",
      "Curl the bar up to shoulder level.",
      "Squeeze your biceps at the top.",
      "Lower the bar back down slowly.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["forearms"]
  },
  {
    id: "fb-0031",
    name: "dumbbell hammer curl",
    bodyPart: "upper arms",
    target: "biceps",
    equipment: "dumbbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with dumbbells at your sides, palms facing your body.",
      "Curl the dumbbells up while keeping your palms facing inwards.",
      "Squeeze at the top.",
      "Lower back down with control.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["forearms", "brachialis"]
  },
  {
    id: "fb-0032",
    name: "tricep dip",
    bodyPart: "upper arms",
    target: "triceps",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Grip parallel bars and lift yourself up with straight arms.",
      "Lower your body by bending your elbows until upper arms are parallel to the floor.",
      "Push back up to the starting position.",
      "Keep your elbows close to your body.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["chest", "anterior deltoids"]
  },
  {
    id: "fb-0033",
    name: "skull crusher",
    bodyPart: "upper arms",
    target: "triceps",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Lie on a flat bench holding an EZ bar above your chest.",
      "Bend your elbows to lower the bar towards your forehead.",
      "Keep your upper arms stationary.",
      "Extend your arms back to the start.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: []
  },
  {
    id: "fb-0034",
    name: "cable tricep pushdown",
    bodyPart: "upper arms",
    target: "triceps",
    equipment: "cable",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand at a cable machine with a straight or rope attachment.",
      "Grip the handle and keep your elbows pinned to your sides.",
      "Push the handle down until your arms are fully extended.",
      "Squeeze your triceps at the bottom.",
      "Return to start with control."
    ],
    secondaryMuscles: []
  },

  // ─── UPPER LEGS ───────────────────────────────────────────
  {
    id: "fb-0040",
    name: "barbell squat",
    bodyPart: "upper legs",
    target: "quads",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Place the barbell on your upper back.",
      "Stand with feet shoulder-width apart.",
      "Lower your hips until thighs are at least parallel to the floor.",
      "Drive through your heels to stand back up.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["glutes", "hamstrings", "core"]
  },
  {
    id: "fb-0041",
    name: "leg press",
    bodyPart: "upper legs",
    target: "quads",
    equipment: "sled machine",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Sit in the leg press machine with feet shoulder-width apart.",
      "Release the safety and lower the platform by bending your knees.",
      "Press the platform back up by extending your legs.",
      "Do not lock your knees at the top.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["glutes", "hamstrings"]
  },
  {
    id: "fb-0042",
    name: "romanian deadlift",
    bodyPart: "upper legs",
    target: "hamstrings",
    equipment: "barbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand holding a barbell at hip level.",
      "Push your hips back while keeping legs mostly straight.",
      "Lower the bar along your legs until you feel a hamstring stretch.",
      "Drive your hips forward to return to standing.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: ["glutes", "lower back"]
  },
  {
    id: "fb-0043",
    name: "walking lunge",
    bodyPart: "upper legs",
    target: "quads",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand upright with feet together.",
      "Step forward with one leg and lower your back knee toward the floor.",
      "Push off your front foot to step forward into the next lunge.",
      "Alternate legs with each step.",
      "Keep your torso upright throughout."
    ],
    secondaryMuscles: ["glutes", "hamstrings"]
  },
  {
    id: "fb-0044",
    name: "leg extension",
    bodyPart: "upper legs",
    target: "quads",
    equipment: "leverage machine",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Sit on the leg extension machine with your legs under the pad.",
      "Extend your legs to full extension.",
      "Squeeze your quads at the top.",
      "Lower the weight back down slowly.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: []
  },
  {
    id: "fb-0045",
    name: "leg curl",
    bodyPart: "upper legs",
    target: "hamstrings",
    equipment: "leverage machine",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Lie face down on the leg curl machine.",
      "Hook your heels under the pad.",
      "Curl the weight up by bending your knees.",
      "Squeeze your hamstrings at the top.",
      "Lower back down with control."
    ],
    secondaryMuscles: ["calves"]
  },
  {
    id: "fb-0046",
    name: "bulgarian split squat",
    bodyPart: "upper legs",
    target: "quads",
    equipment: "dumbbell",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with one foot elevated on a bench behind you.",
      "Hold dumbbells at your sides.",
      "Lower your back knee toward the floor.",
      "Push through your front heel to return to standing.",
      "Repeat, then switch legs."
    ],
    secondaryMuscles: ["glutes", "hamstrings"]
  },

  // ─── LOWER LEGS ───────────────────────────────────────────
  {
    id: "fb-0050",
    name: "standing calf raise",
    bodyPart: "lower legs",
    target: "calves",
    equipment: "leverage machine",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand on a calf raise machine with the balls of your feet on the platform.",
      "Push up onto your toes as high as possible.",
      "Squeeze your calves at the top.",
      "Lower your heels below the platform for a stretch.",
      "Repeat for the desired number of reps."
    ],
    secondaryMuscles: []
  },
  {
    id: "fb-0051",
    name: "seated calf raise",
    bodyPart: "lower legs",
    target: "calves",
    equipment: "leverage machine",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Sit on a seated calf raise machine.",
      "Place the balls of your feet on the platform.",
      "Push up by extending your ankles.",
      "Hold at the top briefly.",
      "Lower back down with control."
    ],
    secondaryMuscles: []
  },

  // ─── WAIST / CORE ────────────────────────────────────────
  {
    id: "fb-0060",
    name: "crunch",
    bodyPart: "waist",
    target: "abs",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Lie on your back with knees bent and feet flat.",
      "Place your hands behind your head or across your chest.",
      "Curl your upper body toward your knees.",
      "Squeeze your abs at the top.",
      "Lower back down with control."
    ],
    secondaryMuscles: []
  },
  {
    id: "fb-0061",
    name: "plank",
    bodyPart: "waist",
    target: "abs",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Start in a push-up position, resting on your forearms.",
      "Keep your body in a straight line from head to heels.",
      "Engage your core and hold the position.",
      "Do not let your hips sag or rise.",
      "Hold for the desired duration."
    ],
    secondaryMuscles: ["shoulders", "glutes"]
  },
  {
    id: "fb-0062",
    name: "hanging leg raise",
    bodyPart: "waist",
    target: "abs",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Hang from a pull-up bar with a full grip.",
      "Keep your legs straight or slightly bent.",
      "Raise your legs until they are parallel to the floor.",
      "Lower them back down slowly.",
      "Avoid swinging."
    ],
    secondaryMuscles: ["hip flexors"]
  },
  {
    id: "fb-0063",
    name: "russian twist",
    bodyPart: "waist",
    target: "abs",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Sit on the floor with knees bent, leaning back slightly.",
      "Hold your hands together or a weight in front of you.",
      "Rotate your torso to the right, then to the left.",
      "Keep your core engaged throughout.",
      "Each rotation to both sides counts as one rep."
    ],
    secondaryMuscles: ["obliques"]
  },
  {
    id: "fb-0064",
    name: "cable woodchop",
    bodyPart: "waist",
    target: "abs",
    equipment: "cable",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Set a cable machine to the highest setting.",
      "Stand sideways to the machine and grip the handle with both hands.",
      "Pull the handle diagonally down across your body.",
      "Control the return to the start.",
      "Complete reps on one side, then switch."
    ],
    secondaryMuscles: ["obliques", "shoulders"]
  },

  // ─── CARDIO ───────────────────────────────────────────────
  {
    id: "fb-0070",
    name: "burpee",
    bodyPart: "cardio",
    target: "cardiovascular system",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Start standing, then squat down and place your hands on the floor.",
      "Jump your feet back into a push-up position.",
      "Perform a push-up.",
      "Jump your feet forward to your hands.",
      "Jump up explosively with arms overhead."
    ],
    secondaryMuscles: ["chest", "legs", "core"]
  },
  {
    id: "fb-0071",
    name: "mountain climber",
    bodyPart: "cardio",
    target: "cardiovascular system",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Start in a push-up position.",
      "Bring one knee toward your chest.",
      "Quickly switch legs, extending the bent leg back.",
      "Continue alternating at a fast pace.",
      "Keep your core tight and hips level."
    ],
    secondaryMuscles: ["abs", "shoulders", "quads"]
  },
  {
    id: "fb-0072",
    name: "jumping jack",
    bodyPart: "cardio",
    target: "cardiovascular system",
    equipment: "body weight",
    gifUrl: "https://v2.exercisedb.io/image/F-cADq2gi0VQZQ",
    instructions: [
      "Stand with feet together and arms at your sides.",
      "Jump your feet out wide while raising your arms overhead.",
      "Jump back to the starting position.",
      "Keep a brisk, steady pace.",
      "Repeat for the desired duration."
    ],
    secondaryMuscles: ["calves", "shoulders"]
  },
];
