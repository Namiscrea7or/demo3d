"use client";

import { useState, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { v4 as uuidv4 } from 'uuid';
import type { Object3D } from 'three';
import * as THREE from 'three';

import Sidebar from "../sidebar/sidebar";
import ThreeScene from "../threeScene/index";
import ViewportToolbar from "../viewport/viewPort";
import InstructionPanel from "../instructions/instructsionBar";

import usePhaseManager from "@/hooks/usePhaseManager";
import useAnimationManager from "@/hooks/useAnimationManager";
import { applyTransforms, extractTransforms } from "@/utils/transformUtils";
import type { Phase } from '@/types';

const applyVisibility = (scene: Object3D, visibility: Record<string, boolean>) => {
  scene.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.visible = visibility[obj.name] ?? true;
    }
  });
};

export default function Layout3D() {
  const [activeScene, setActiveScene] = useState<Object3D | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'select' | 'translate' | 'rotate' | 'scale'>('translate');
  const [version, setVersion] = useState(0);

  const { scene: loadedScene } = useGLTF("/ABB.glb");

  const {
    phases,
    setPhases,
    currentPhaseIndex,
    currentSubStepIndex,
    currentVisibility,
    handlePhaseClick,
    handleSubStepClick,
    handleAddPhase,
    handleAddSubStep,
    handleTransformStart,
    handleTransformChange,
    handleTransformFinal,
    handleUndo,
    handleRedo,
    toggleVisibility,
    resetVisibility,
    handleUpdateTransformFromSidebar,
    canUndo,
    canRedo,
  } = usePhaseManager([], activeScene);

  const { isAnimating, spring, handleOnPlay } = useAnimationManager(
    phases,
    currentPhaseIndex,
    handleSubStepClick
  );

  useEffect(() => {
    if (loadedScene && !activeScene) {
      const initialScene = loadedScene.clone();
      
      const firstPhase: Phase = {
        id: uuidv4(),
        name: "Giai đoạn 1",
        subSteps: [{
          id: uuidv4(),
          transforms: extractTransforms(initialScene),
          visibility: (() => {
            const vis: Record<string, boolean> = {};
            initialScene.traverse(o => { if (o instanceof THREE.Mesh) vis[o.name] = true; });
            return vis;
          })(),
          transformHistory: { past: [], future: [] },
        }],
      };
      
      setPhases([firstPhase]);
      setActiveScene(initialScene);
    }
  }, [loadedScene, activeScene, setPhases]);

  useEffect(() => {
    if (activeScene && phases.length > 0) {
      const currentSubStep = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex];
      if (currentSubStep) {
        applyTransforms(activeScene, currentSubStep.transforms);
        applyVisibility(activeScene, currentSubStep.visibility);
        setVersion(v => v + 1);
      }
    }
  }, [currentPhaseIndex, currentSubStepIndex, phases, activeScene]);
  
  const selectedObjectNode = useMemo(() => {
    if (!activeScene || !selectedObject) return null;
    return activeScene.getObjectByName(selectedObject) ?? null;
  }, [activeScene, selectedObject]);

  const handleHideSelected = () => {
    if (selectedObject) {
      toggleVisibility(selectedObject);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        scene={activeScene}
        visibility={currentVisibility}
        toggleVisibility={toggleVisibility}
        resetVisibility={resetVisibility}
        selectedObject={selectedObject}
        onSelectObject={setSelectedObject}
        selectedObjectNode={selectedObjectNode}
        onUpdateTransform={handleUpdateTransformFromSidebar}
      />
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 bg-gray-950">
          {activeScene && (
            <ThreeScene
              scene={activeScene}
              visibility={currentVisibility}
              selectedObjectNode={selectedObjectNode}
              transformMode={transformMode}
              onTransformStart={handleTransformStart}
              onTransformChange={() => activeScene && handleTransformChange(selectedObject, activeScene)}
              onTransformFinal={handleTransformFinal}
              onSelectObject={setSelectedObject}
              isAnimating={isAnimating}
              version={version}
              animationSubSteps={phases[currentPhaseIndex]?.subSteps || []}
              animationSpring={spring}
            />
          )}
        </div>
        <ViewportToolbar
          transformMode={transformMode}
          onSetTransformMode={setTransformMode}
          onHideSelected={handleHideSelected}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        <InstructionPanel
          phases={phases.map(p => ({
            id: p.id,
            name: p.name,
            subSteps: p.subSteps.map(ss => ({ id: ss.id })),
          }))}
          currentPhaseIndex={currentPhaseIndex}
          currentSubStepIndex={currentSubStepIndex}
          onPhaseClick={handlePhaseClick}
          onSubStepClick={handleSubStepClick}
          onAddPhase={handleAddPhase}
          onAddSubStep={handleAddSubStep}
          onPlay={handleOnPlay}
        />
      </div>
    </div>
  );
}