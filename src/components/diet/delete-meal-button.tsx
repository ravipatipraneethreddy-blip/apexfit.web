"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteMeal } from "@/actions/diet.actions";
import { useRouter } from "next/navigation";

export function DeleteMealButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteMeal(id);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
