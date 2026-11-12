"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { deleteMeal } from "@/actions/diet.actions";
import { useRouter } from "next/navigation";

export function DeleteMealButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const {toast} = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      try { await deleteMeal(id); router.refresh(); } catch { toast("Meal was not deleted. Please retry.", "error"); }
    });
  };

  return (
    <button
      aria-label="Delete meal"
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}

