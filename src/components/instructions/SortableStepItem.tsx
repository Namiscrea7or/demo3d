"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { X } from "lucide-react";
import React from "react";

export function SortableStepItem({
  id,
  stepIndex,
  isSelected,
  onClick,
  onDelete,
}: {
  id: any;
  stepIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { type: "step" },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      <button
        onClick={onClick}
        className={clsx(
          "w-full h-full flex flex-col items-center justify-center rounded-lg flex-shrink-0 transition-all border",
          isSelected
            ? "bg-sky-600/30 border-sky-500 shadow-lg"
            : "bg-slate-700/50 border-transparent hover:border-slate-500 text-slate-300"
        )}
        {...attributes}
        {...listeners}
      >
        <span className={clsx("text-xs -mt-1 mb-1", isSelected ? "text-sky-200" : "text-slate-400")}>
          Step
        </span>
        <span className={clsx("text-4xl font-bold", isSelected ? "text-white" : "text-slate-200")}>
          {stepIndex + 1}
        </span>
      </button>

      <button
        onClick={onDelete}
        className="absolute right-2 top-2 p-1 rounded-full bg-slate-600/50 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/50 hover:text-white transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
