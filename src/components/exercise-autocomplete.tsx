"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Dumbbell } from "lucide-react";

// Comprehensive exercise database
const EXERCISES = [
  // Chest
  "Barbell Bench Press", "Incline Barbell Bench Press", "Decline Barbell Bench Press",
  "Dumbbell Bench Press", "Incline Dumbbell Press", "Decline Dumbbell Press",
  "Dumbbell Flyes", "Cable Flyes", "Machine Chest Press", "Push Ups", "Dips (Chest)",
  "Pec Deck", "Cable Crossover", "Landmine Press",
  // Back
  "Barbell Rows", "Dumbbell Rows", "Pendlay Rows", "T-Bar Rows",
  "Pull Ups", "Chin Ups", "Lat Pulldown", "Seated Cable Row",
  "Face Pulls", "Rear Delt Flyes", "Straight Arm Pulldown", "Deadlift",
  "Rack Pull", "Hyperextensions", "Cable Pullover",
  // Shoulders
  "Overhead Press", "Military Press", "Dumbbell Shoulder Press", "Arnold Press",
  "Lateral Raises", "Front Raises", "Upright Rows", "Reverse Flyes",
  "Cable Lateral Raise", "Machine Shoulder Press", "Shrugs",
  // Arms
  "Barbell Curl", "Dumbbell Curl", "Hammer Curls", "Preacher Curl",
  "Concentration Curl", "Cable Curl", "EZ Bar Curl", "Spider Curl",
  "Tricep Pushdown", "Overhead Tricep Extension", "Skull Crushers",
  "Close Grip Bench Press", "Tricep Dips", "Kickbacks",
  // Legs
  "Barbell Squats", "Front Squats", "Goblet Squats", "Hack Squats",
  "Leg Press", "Leg Extensions", "Leg Curls", "Romanian Deadlift",
  "Sumo Deadlift", "Bulgarian Split Squat", "Walking Lunges",
  "Hip Thrusts", "Calf Raises", "Seated Calf Raises", "Glute Bridge",
  "Step Ups", "Box Jumps", "Sissy Squat",
  // Compound / Full Body
  "Clean and Press", "Power Clean", "Snatch", "Thrusters",
  "Kettlebell Swings", "Turkish Get Up", "Farmer's Walk",
  // Core
  "Plank", "Hanging Leg Raise", "Ab Wheel Rollout", "Cable Crunch",
  "Russian Twist", "Woodchoppers", "Decline Sit Ups", "Dragon Flag",
  // Cardio
  "Treadmill Run", "Cycling", "Rowing Machine", "Stairmaster",
  "Jump Rope", "Battle Ropes", "Burpees", "Mountain Climbers",
];

export default function ExerciseAutocomplete({
  value,
  onChange,
  placeholder = "Exercise name...",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (val.length >= 1) {
      const q = val.toLowerCase();
      const matches = EXERCISES.filter((e) => e.toLowerCase().includes(q)).slice(0, 8);
      setFiltered(matches);
      setIsOpen(matches.length > 0);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelect = (exercise: string) => {
    onChange(exercise);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    if (value.length >= 1) {
      const q = value.toLowerCase();
      const matches = EXERCISES.filter((e) => e.toLowerCase().includes(q)).slice(0, 8);
      setFiltered(matches);
      setIsOpen(matches.length > 0);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="bg-transparent font-bold text-sm w-full focus:outline-none placeholder:text-muted-foreground/50 pl-7"
        />
      </div>

      <AnimatePresence>
        {isOpen && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden max-h-48 overflow-y-auto"
          >
            {filtered.map((exercise, i) => (
              <button
                key={exercise}
                onClick={() => handleSelect(exercise)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/10 transition flex items-center gap-2 border-b border-border/30 last:border-0"
              >
                <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  {exercise.split(new RegExp(`(${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi")).map((part, j) =>
                    part.toLowerCase() === value.toLowerCase() ? (
                      <span key={j} className="text-primary font-bold">{part}</span>
                    ) : (
                      <span key={j}>{part}</span>
                    )
                  )}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
