"use client";

type SubStep = {
  id: string;
};

type Phase = {
  id: string;
  name: string;
  subSteps: SubStep[];
};

type InstructionPanelProps = {
  phases: Phase[];
  currentPhaseIndex: number;
  currentSubStepIndex: number;
  onPhaseClick: (index: number) => void;
  onSubStepClick: (index: number) => void;
  onAddPhase: () => void;
  onAddSubStep: () => void;
  onPlay: () => void;
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
}: InstructionPanelProps) {
  const currentPhase = phases[currentPhaseIndex];

  return (
    <div className="flex-shrink-0 bg-gray-800 p-4 border-t border-gray-700 select-none">
      <div className="flex justify-center items-stretch space-x-2">
        {phases.map((phase, phaseIndex) => (
          <div
            key={phase.id}
            className={`phase-container p-2 rounded-lg cursor-pointer transition-colors ${
              currentPhaseIndex === phaseIndex
                ? 'bg-teal-600'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => onPhaseClick(phaseIndex)}
          >
            <div className="text-center text-sm font-bold mb-2 text-white">
              {phase.name.toUpperCase()}
            </div>
            <div className="flex items-center space-x-1">
              {phase.subSteps.map((subStep, subStepIndex) => (
                <div key={subStep.id} className="flex items-center space-x-1">
                  <div
                    className={`substep-item w-24 h-16 bg-gray-500 rounded-md flex items-end justify-center p-1 cursor-pointer border-2 ${
                      currentPhaseIndex === phaseIndex && currentSubStepIndex === subStepIndex
                        ? 'border-teal-300'
                        : 'border-transparent'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      onSubStepClick(subStepIndex);
                    }}
                  >
                    <span className="bg-gray-800 bg-opacity-70 text-white text-xs font-bold rounded-full px-2 py-0.5">
                      {subStepIndex + 1}
                    </span>
                  </div>
                  {currentPhaseIndex === phaseIndex && subStepIndex === phase.subSteps.length - 1 && (
                     <button
                        className="add-substep-btn flex-shrink-0 w-6 h-16 bg-gray-600 hover:bg-gray-500 rounded-md text-white text-xl font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddSubStep();
                        }}
                      >
                        +
                      </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button
          className="add-phase-btn self-stretch w-8 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-2xl"
          onClick={onAddPhase}
        >
          +
        </button>
      </div>
       <div className="flex justify-center mt-4">
        {currentPhase?.subSteps.length > 1 && (
            <button onClick={onPlay} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-bold">
              Play Animation
            </button>
        )}
       </div>
    </div>
  );
}