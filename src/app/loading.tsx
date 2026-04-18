import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-start font-sans">
      <div className="max-w-5xl w-full flex flex-col gap-6">
        <div className="flex items-center justify-between mt-6">
          <div className="flex flex-col gap-2">
            <div className="h-8 w-48 bg-border/40 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-border/20 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-10 rounded-full bg-border/40 animate-pulse" />
        </div>

        <div className="w-full h-48 rounded-2xl bg-border/20 animate-pulse flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-32 rounded-2xl bg-border/20 animate-pulse" />
          <div className="h-32 rounded-2xl bg-border/20 animate-pulse" />
          <div className="h-32 rounded-2xl bg-border/20 animate-pulse" />
          <div className="h-32 rounded-2xl bg-border/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
