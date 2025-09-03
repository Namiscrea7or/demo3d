"use client";

import { useEffect, useRef } from "react";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { Play, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { SortableStepItem } from "./SortableStepItem";

type StepPanelProps = {
  activePhase: { id: string; name: string; subSteps: { id: string }[] } | undefined;
  currentPhaseIndex: number;
  currentSubStepIndex: number;
  isLastPhase: boolean;
  onPlay: () => void;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  onSubStepClick: (phaseIndex: number, subStepIndex: number) => void;
  onAddSubStep: (phaseIndex: number) => void;
  onDeleteStep: (phaseIndex: number, subStepIndex: number) => void;
};

export function StepPanel(props: StepPanelProps) {
  const {
    activePhase,
    currentPhaseIndex,
    currentSubStepIndex,
    isLastPhase,
    onPlay,
    onPrevPhase,
    onNextPhase,
    onSubStepClick,
    onAddSubStep,
    onDeleteStep,
  } = props;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current || activePhase == null) return;
    const el = scrollRef.current.querySelector<HTMLElement>(
      `[data-step-index="${currentSubStepIndex}"]`
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [currentSubStepIndex, activePhase?.id]);

  return (
    <div className="flex-grow flex flex-col min-w-0 space-y-4">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onPrevPhase}
          disabled={currentPhaseIndex === 0}
          className="p-2 bg-slate-700/50 rounded-full disabled:opacity-30 enabled:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft size={18} className="text-slate-300" />
        </button>
        <button
          onClick={onPlay}
          className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all"
        >
          <Play size={16} />
          <span>Play Animation</span>
        </button>
        <button
          onClick={onNextPhase}
          disabled={isLastPhase}
          className="p-2 bg-slate-700/50 rounded-full disabled:opacity-30 enabled:hover:bg-slate-700 transition-colors"
        >
          <ChevronRight size={18} className="text-slate-300" />
        </button>
      </div>

      <div className="border-t border-slate-700/80" />

      <div className="flex-grow flex flex-col min-w-0">
        {activePhase ? (
          <>
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
              Steps for {activePhase.name}
            </div>

            <div className="flex items-stretch h-24">
              <div ref={scrollRef} className="flex-grow overflow-x-auto">
                <div className="flex items-stretch gap-3 h-full">
                  <SortableContext
                    items={activePhase.subSteps.map((s) => s.id)}
                    strategy={horizontalListSortingStrategy}
                  >
                    {activePhase.subSteps.map((subStep, subStepIndex) => (
                      <div
                        key={subStep.id}
                        data-step-index={subStepIndex}
                        className="w-44 h-full flex-shrink-0"
                      >
                        <SortableStepItem
                          id={subStep.id}
                          stepIndex={subStepIndex}
                          isSelected={subStepIndex === currentSubStepIndex}
                          onClick={() => onSubStepClick(currentPhaseIndex, subStepIndex)}
                          onDelete={(e) => {
                            e.stopPropagation();
                            onDeleteStep(currentPhaseIndex, subStepIndex);
                          }}
                        />
                      </div>
                    ))}
                  </SortableContext>
                </div>
              </div>

              <div className="w-24 h-24 flex-shrink-0 ml-3">
                <button
                  onClick={() => onAddSubStep(currentPhaseIndex)}
                  className="w-full h-full flex items-center justify-center rounded-lg 
                             text-slate-500 border-2 border-dashed border-slate-600 
                             hover:border-slate-500 hover:bg-slate-700/50 transition-colors"
                >
                  <Plus size={28} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            No Phases Available
          </div>
        )}
      </div>
    </div>
  );
}
