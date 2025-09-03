"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { PhaseColumn } from "./PhaseColumn";
import { StepPanel } from "./StepPanel";
import type { Phase } from '@/types';

type InstructionPanelProps = {
  phases: Phase[];
  currentPhaseIndex: number;
  currentSubStepIndex: number;
  onPhaseClick: (phaseIndex: number) => void;
  onSubStepClick: (phaseIndex: number, subStepIndex: number) => void;
  onAddPhase: () => void;
  onAddSubStep: (phaseIndex: number) => void;
  onPlay: () => void;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  onDeletePhase: (phaseIndex: number) => void;
  onDeleteStep: (phaseIndex: number, subStepIndex: number) => void;
  onReorderPhases: (oldIndex: number, newIndex: number) => void;
  onReorderSteps: (phaseIndex: number, oldIndex: number, newIndex: number) => void;
};

export default function InstructionPanel(props: InstructionPanelProps) {
  const {
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
    onDeletePhase,
    onDeleteStep,
    onReorderPhases,
    onReorderSteps,
  } = props;

  const activePhase = phases[currentPhaseIndex];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "phase" && overType === "phase") {
      const oldIndex = phases.findIndex((p) => p.id === active.id);
      const newIndex = phases.findIndex((p) => p.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderPhases(oldIndex, newIndex);
      }
    } else if (activeType === "step" && overType === "step" && activePhase) {
      const oldIndex = activePhase.subSteps.findIndex((s) => s.id === active.id);
      const newIndex = activePhase.subSteps.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderSteps(currentPhaseIndex, oldIndex, newIndex);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-slate-800/80 backdrop-blur-lg border border-slate-700/50 
             p-4 rounded-xl shadow-2xl flex space-x-4 w-full h-[30vh] overflow-y-hidden">
          <PhaseColumn
            phases={phases}
            currentPhaseIndex={currentPhaseIndex}
            onPhaseClick={onPhaseClick}
            onAddPhase={onAddPhase}
            onDeletePhase={onDeletePhase}
          />
          <StepPanel
            activePhase={activePhase}
            currentPhaseIndex={currentPhaseIndex}
            currentSubStepIndex={currentSubStepIndex}
            isLastPhase={currentPhaseIndex >= phases.length - 1}
            onPlay={onPlay}
            onPrevPhase={onPrevPhase}
            onNextPhase={onNextPhase}
            onSubStepClick={onSubStepClick}
            onAddSubStep={onAddSubStep}
            onDeleteStep={onDeleteStep}
          />
        </div>
      </div>
    </DndContext>
  );
}