"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { X, ImageOff } from "lucide-react";
import React from "react";

export function SortableStepItem({
  id,
  stepIndex,
  thumbnail,
  isSelected,
  onClick,
  onDelete,
}: {
  id: any;
  stepIndex: number;
  thumbnail?: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      data: { type: "step" },
    });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="relative group h-full">
      <button
        onClick={onClick}
        className={clsx(
          "w-full h-full flex flex-col items-center justify-center rounded-lg flex-shrink-0 transition-all border overflow-hidden",
          isSelected
            ? "bg-sky-600/30 border-sky-500 shadow-lg"
            : "bg-slate-700/50 border-transparent hover:border-slate-500 text-slate-300"
        )}
        {...attributes}
        {...listeners}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`Step ${stepIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <ImageOff size={24} className="mb-2 text-slate-500" />
            <span className="text-xs text-slate-400">No Preview</span>
          </div>
        )}
        <div className="absolute bottom-1 left-2 w-6 h-6 bg-slate-800/80 rounded-full flex items-center justify-center">
          <span
            className={clsx(
              "font-bold",
              isSelected ? "text-white" : "text-slate-200"
            )}
          >
            {stepIndex + 1}
          </span>
        </div>
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