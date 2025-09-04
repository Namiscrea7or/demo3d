"use client";

import { ChevronLeft, ChevronRight, Play, Pause, X } from 'lucide-react';

interface SubStep {
  id: string;
  description?: string;
}

interface Phase {
  id: string;
  name: string;
  subSteps: SubStep[];
}

type InstructionPanelProps = {
  animationData: Phase[];
  currentPhaseIndex: number;
  currentSubStepIndex: number;
  isPlaying: boolean;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  onPlayToggle: () => void;
  onClose: () => void;
};

export default function InstructionPanel({
  animationData,
  currentPhaseIndex,
  currentSubStepIndex,
  isPlaying,
  onPrevPhase,
  onNextPhase,
  onPlayToggle,
  onClose,
}: InstructionPanelProps) {

  const currentPhase = animationData[currentPhaseIndex];
  const currentStep = currentPhase?.subSteps[currentSubStepIndex];
  const totalStepsInPhase = currentPhase?.subSteps.length || 0;

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-white bg-opacity-80 backdrop-blur-md shadow-lg flex flex-col p-6 border-l border-gray-200 text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Step {currentSubStepIndex + 1}</h1>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">DESCRIPTION</p>
        <p className="text-gray-700 mt-2">
          {currentStep?.description || "Install the glass into the frame and attach the hinge."}
        </p>
      </div>

      <div className="mt-auto flex flex-col items-center">
        <div className="flex justify-center items-center space-x-4 mb-4">
            <button 
                onClick={onPrevPhase}
                disabled={currentPhaseIndex === 0}
                className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={onPlayToggle}
                className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button 
                onClick={onNextPhase}
                disabled={currentPhaseIndex >= animationData.length - 1}
                className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
                <ChevronRight size={24} />
            </button>
        </div>
        
        <div className="flex items-center justify-center space-x-2">
          {Array.from({ length: totalStepsInPhase }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentSubStepIndex ? 'bg-blue-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}