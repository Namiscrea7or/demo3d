"use client";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { GripVertical, X } from 'lucide-react';
import React from 'react';

export function SortablePhaseItem({ id, phase, isSelected, onClick, onDelete }: { id: any, phase: any, isSelected: boolean, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
    data: { type: 'phase' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <button
        onClick={onClick}
        className={clsx(
          "w-full text-left py-3 px-2.5 rounded-lg text-sm truncate transition-colors flex items-center space-x-2",
          isSelected ? "bg-sky-600 text-white font-semibold shadow" : "bg-slate-700/50 hover:bg-slate-700 text-slate-300"
        )}
      >
        <div {...attributes} {...listeners} className="cursor-grab touch-none p-1">
          <GripVertical size={18} className="text-slate-400" />
        </div>
        <span className="flex-grow font-medium">Animation {phase.name.slice(-1)}</span>
      </button>
      <button
        onClick={onDelete}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-600/50 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/50 hover:text-white transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}