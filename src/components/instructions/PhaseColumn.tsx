"use client";

import { useEffect, useRef } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { SortablePhaseItem } from "./SortablePhaseItem";

type PhaseColumnProps = {
  phases: { id: string; name: string; subSteps: { id: string }[] }[];
  currentPhaseIndex: number;
  onPhaseClick: (index: number) => void;
  onAddPhase: () => void;
  onDeletePhase: (index: number) => void;
};

export function PhaseColumn(props: PhaseColumnProps) {
  const { phases, currentPhaseIndex, onPhaseClick, onAddPhase, onDeletePhase } = props;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const selected = scrollRef.current.querySelector<HTMLDivElement>(
      `[data-phase-index="${currentPhaseIndex}"]`
    );
    if (selected) {
      selected.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [currentPhaseIndex]);

  return (
    <div className="w-64 flex-shrink-0 flex flex-col pr-4 border-r border-slate-700/80 h-full">
      <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
        Animations
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 pr-2">
        <SortableContext items={phases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          {phases.map((phase, phaseIndex) => (
            <div key={phase.id} data-phase-index={phaseIndex}>
              <SortablePhaseItem
                id={phase.id}
                phase={phase}
                isSelected={phaseIndex === currentPhaseIndex}
                onClick={() => onPhaseClick(phaseIndex)}
                onDelete={(e) => {
                  e.stopPropagation();
                  onDeletePhase(phaseIndex);
                }}
              />
            </div>
          ))}
        </SortableContext>
      </div>
      <button
        onClick={onAddPhase}
        className="mt-2 w-full flex items-center justify-center space-x-2 py-3 px-2.5 text-sm text-slate-400 border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 rounded-lg transition-colors"
      >
        <Plus size={16} />
        <span>Add Animation</span>
      </button>
    </div>
  );
}
