"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import type { Object3D, Material } from 'three';
import * as THREE from 'three';

import Sidebar from "../sidebar/sidebar";
import ThreeScene from "../threeScene/index";
import ViewportToolbar from "../viewport/viewPort";
import InstructionPanel from "../instructions/instructsionBar";
import FileUpload from "../FileUpload";
import TopBar from "./TopBar";

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

  const [colorOverrides, setColorOverrides] = useState<Record<string, THREE.Color>>({});
  const originalMaterials = useRef(new Map<string, Material | Material[]>());

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

  const handleSceneLoaded = useCallback((loadedScene: Object3D) => {
    setSelectedObject(null);
    setColorOverrides({});
    originalMaterials.current.clear();
    setTransformMode('translate');

    const initialScene = loadedScene.clone();
    
    const firstPhase: Phase = {
      id: uuidv4(),
      name: "Phase 1",
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
  }, [setPhases]);

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

  const handleUpdateColor = useCallback((name: string, newColor: THREE.Color | null) => {
    const object = activeScene?.getObjectByName(name);
    if (!object) return;

    setColorOverrides(prev => {
      const newOverrides = { ...prev };
      if (newColor) {
        newOverrides[name] = newColor;
      } else {
        delete newOverrides[name];
      }
      return newOverrides;
    });

    object.traverse(child => {
      if (child instanceof THREE.Mesh) {
        if (newColor) {
          if (!originalMaterials.current.has(child.uuid)) {
            originalMaterials.current.set(child.uuid, child.material);
          }
          if (Array.isArray(child.material)) {
            child.material = child.material.map(m => {
                const newMat = m.clone();
                newMat.color.set(newColor);
                return newMat;
            });
          } else {
            child.material = child.material.clone();
            child.material.color.set(newColor);
          }
        } else {
          if (originalMaterials.current.has(child.uuid)) {
            child.material = originalMaterials.current.get(child.uuid)!;
            originalMaterials.current.delete(child.uuid);
          }
        }
      }
    });
    setVersion(v => v + 1);
  }, [activeScene]);

  const handleHideSelected = () => {
    if (selectedObject) {
      toggleVisibility(selectedObject);
    }
  };

  const handleExport = useCallback(() => {
    if (phases.length === 0) return;

    const dataToExport = {
      animationData: phases.map(phase => ({
        ...phase,
        subSteps: phase.subSteps.map(subStep => {
          const { transformHistory, ...rest } = subStep;
          return rest;
        })
      }))
    };
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animation_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  }, [phases]);

  if (!activeScene) {
    return <FileUpload onSceneLoaded={handleSceneLoaded} />;
  }

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
        overrideColor={selectedObject ? colorOverrides[selectedObject] || null : null}
        onUpdateColor={handleUpdateColor}
      />
      <div className="flex-1 flex flex-col relative">
        <TopBar onExport={handleExport} />
        <div className="flex-1 bg-gray-950">
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