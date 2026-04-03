"use client";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex items-start justify-center font-sans animate-pulse">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-secondary rounded-lg" />
            <div className="w-24 h-7 bg-secondary rounded-lg" />
          </div>
          <div className="w-10 h-10 bg-secondary rounded-full" />
        </div>
        {/* Coach */}
        <div className="bg-card rounded-2xl p-6 mb-8 h-28" />
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-5 h-24" />
          ))}
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-5 h-72" />
          <div className="bg-card rounded-2xl p-5 h-72" />
        </div>
      </div>
    </div>
  );
}

export function WorkoutSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans animate-pulse">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="w-9 h-9 bg-secondary rounded-xl" />
          <div className="w-32 h-7 bg-secondary rounded-lg" />
          <div className="flex gap-1">
            <div className="w-9 h-9 bg-secondary rounded-xl" />
            <div className="w-9 h-9 bg-secondary rounded-xl" />
          </div>
        </div>
        {/* Timer */}
        <div className="bg-card rounded-2xl p-4 mb-6 h-16" />
        {/* Exercises */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 mb-4 h-48" />
        ))}
      </div>
    </div>
  );
}

export function DietSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans animate-pulse">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="w-9 h-9 bg-secondary rounded-xl" />
          <div className="w-32 h-7 bg-secondary rounded-lg" />
          <div className="w-9" />
        </div>
        {/* Macro rings */}
        <div className="bg-card rounded-2xl p-5 mb-6 h-52" />
        {/* Search */}
        <div className="bg-card rounded-2xl h-14 mb-6" />
        {/* Quick add pills */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-20 h-10 bg-card rounded-xl shrink-0" />
          ))}
        </div>
        {/* Meals */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl p-4 mb-3 h-20" />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans animate-pulse">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="w-9 h-9 bg-secondary rounded-xl" />
          <div className="w-16 h-7 bg-secondary rounded-lg" />
          <div className="w-9 h-9 bg-secondary rounded-xl" />
        </div>
        {/* Avatar card */}
        <div className="bg-card rounded-2xl p-6 mb-6 h-40" />
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-3 h-20" />
          ))}
        </div>
        {/* Form */}
        <div className="bg-card rounded-2xl p-5 h-96" />
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex justify-center font-sans animate-pulse">
      <div className="max-w-5xl w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="w-9 h-9 bg-secondary rounded-xl" />
          <div className="w-24 h-7 bg-secondary rounded-lg" />
          <div className="w-9" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl p-5 h-72" />
          ))}
        </div>
      </div>
    </div>
  );
}
