"use client";

import clsx from 'clsx';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

type InstructionPanelProps = {
  phases: { id: string; name: string; subSteps: { id: string }[] }[];
  currentPhaseIndex: number;
  currentSubStepIndex: number;
  onPhaseClick: (phaseIndex: number) => void;
  onSubStepClick: (phaseIndex: number, subStepIndex: number) => void;
  onAddPhase: () => void;
  onAddSubStep: (phaseIndex: number) => void;
  onPlay: () => void;
  onPrevPhase: () => void;
  onNextPhase: () => void;
};

export default function InstructionPanel({
  phases,
  currentPhaseIndex,
  currentSubStepIndex,
  onPhaseClick,
  onSubStepClick,
  onAddPhase,
  onAddSubStep,
  onPlay,
  onPrevPhase,
  onNextPhase,
}: InstructionPanelProps) {
  const activePhase = phases[currentPhaseIndex];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-auto max-w-4xl bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg flex flex-col space-y-3">
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onPrevPhase}
          disabled={currentPhaseIndex === 0}
          className="p-2 bg-gray-700 rounded-full disabled:opacity-50 hover:bg-gray-600"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={onPlay}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <Play size={16} />
          <span>Play Animation</span>
        </button>
        <button
          onClick={onNextPhase}
          disabled={currentPhaseIndex >= phases.length - 1}
          className="p-2 bg-gray-700 rounded-full disabled:opacity-50 hover:bg-gray-600"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="border-t border-gray-700" />

      <div className="flex h-[150px] space-x-3">
        <div className="w-48 flex-shrink-0 flex flex-col space-y-2 pr-3 border-r border-gray-700">
          <div className="flex-grow overflow-y-auto space-y-1">
            {phases.map((phase, phaseIndex) => (
              <button
                key={phase.id}
                onClick={() => onPhaseClick(phaseIndex)}
                className={clsx(
                  "w-full text-left p-2 rounded text-sm truncate",
                  phaseIndex === currentPhaseIndex ? "bg-teal-600 text-white" : "bg-gray-700/50 hover:bg-gray-600"
                )}
              >
                {phase.name}
              </button>
            ))}
          </div>
          <button
            onClick={onAddPhase}
            className="w-full p-2 text-sm bg-gray-600 hover:bg-gray-500 rounded"
          >
            + Add Phase
          </button>
        </div>

        <div className="flex-grow flex flex-col">
          {activePhase ? (
            <>
              <div className="text-xs font-bold uppercase tracking-wider mb-2">
                Steps for {activePhase.name}
              </div>
              <div className="flex-grow overflow-y-auto">
                <div className="flex items-center flex-wrap gap-2">
                  {activePhase.subSteps.map((subStep, subStepIndex) => (
                    <button
                      key={subStep.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSubStepClick(currentPhaseIndex, subStepIndex);
                      }}
                      className={clsx(
                        "w-10 h-10 flex items-center justify-center rounded text-sm font-mono flex-shrink-0",
                        subStepIndex === currentSubStepIndex
                          ? "bg-teal-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-teal-500"
                          : "bg-gray-600 hover:bg-gray-500"
                      )}
                    >
                      {subStepIndex + 1}
                    </button>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddSubStep(currentPhaseIndex);
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded text-lg bg-gray-600/50 hover:bg-gray-500 flex-shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </>
          ) : (
             <div className="flex items-center justify-center h-full text-gray-500">
                No Phases Available
             </div>
          )}
        </div>
      </div>
    </div>
  );
}