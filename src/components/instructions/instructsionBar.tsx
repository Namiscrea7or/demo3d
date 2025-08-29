"use client";

type Props = {
  animationData: any[];
  phaseIndex: number;
  subStepIndex: number;
  isPlaying: boolean;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  onPlayToggle: () => void;
};

export default function InstructionBar({
  animationData,
  phaseIndex,
  subStepIndex,
  isPlaying,
  onPrevPhase,
  onNextPhase,
  onPlayToggle,
}: Props) {
  const currentPhase = animationData ? animationData[phaseIndex] : null;
  const instructionText = currentPhase ? currentPhase.name : "Loading...";
  const totalPhases = animationData ? animationData.length : 0;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-100 border-t border-gray-300 p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-700 font-medium">
          {subStepIndex + 1}
        </div>
        <div className="text-gray-800 text-base font-medium max-w-3xl">
          {instructionText}
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={onPrevPhase}
          disabled={phaseIndex === 0}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black shadow hover:bg-gray-100 disabled:opacity-40"
        >
          ◀
        </button>
        <button
          onClick={onPlayToggle}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow hover:bg-gray-100"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button
          onClick={onNextPhase}
          disabled={phaseIndex >= totalPhases - 1}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black shadow hover:bg-gray-100 disabled:opacity-40"
        >
          ▶
        </button>
      </div>
    </div>
  );
}