import { Dumbbell } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 aspect-square rounded-full bg-primary/20 animate-ping" />
          <div className="relative p-6 bg-secondary/80 backdrop-blur rounded-full border border-primary/20 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
            <Dumbbell className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Loading Your Exercises...</h2>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Racking the weights on the server
            <span className="inline-flex tracking-widest pl-1">...</span>
          </p>
        </div>
      </div>
    </div>
  );
}
