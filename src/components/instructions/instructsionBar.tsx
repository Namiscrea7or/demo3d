"use client";

import StepButton from "./StepButton";
import AddStepButton from "./AddStepButton";
import PlayButton from "./PlayButton";

type InstructionBarProps = {
  steps: string[];
  currentStep: number;
  onStepClick: (index: number) => void;
  onAddStep: () => void;
  onPlay: () => void;
};

export default function InstructionBar({
  steps,
  currentStep,
  onStepClick,
  onAddStep,
  onPlay,
}: InstructionBarProps) {
  return (
    <div className="flex-shrink-0 bg-gray-800 p-4 border-t border-gray-700">
      <div className="flex justify-center items-center space-x-4">
        {steps.map((step, index) => (
          <StepButton
            key={index}
            label={step}
            index={index}
            active={currentStep === index}
            onClick={() => onStepClick(index)}
          />
        ))}

        {/* MODIFIED: Move AddStepButton and PlayButton outside the loop */}
        <AddStepButton onClick={onAddStep} />
        {steps.length > 1 && <PlayButton onClick={onPlay} />}
      </div>
    </div>
  );
}