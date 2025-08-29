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

const applyColors = (
  scene: Object3D,
  colorOverrides: Record<string, string>,
  originalMaterials: React.MutableRefObject<Map<string, Material | Material[]>>
) => {
  scene.traverse(child => {
    if (child instanceof THREE.Mesh) {
      if (originalMaterials.current.has(child.uuid)) {
        child.material = originalMaterials.current.get(child.uuid)!;
        originalMaterials.current.delete(child.uuid);
      }
      const newColorHex = colorOverrides[child.name];
      if (newColorHex) {
        if (!originalMaterials.current.has(child.uuid)) {
          originalMaterials.current.set(child.uuid, child.material);
        }
        const newColor = new THREE.Color(newColorHex);
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
      }
    }
  });
};

export default function Layout3D() {
  const [activeScene, setActiveScene] = useState<Object3D | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'select' | 'translate' | 'rotate' | 'scale'>('translate');
  const [version, setVersion] = useState(0);

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
    handleUpdatePhaseColor,
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

  const handleAnimationStepChange = useCallback((subStepIndex: number) => {
    handleSubStepClick(currentPhaseIndex, subStepIndex);
  }, [currentPhaseIndex, handleSubStepClick]);

  const { isAnimating, spring, handleOnPlay } = useAnimationManager(
    phases,
    currentPhaseIndex,
    handleAnimationStepChange
  );

  const handleSceneLoaded = useCallback((loadedScene: Object3D) => {
    setSelectedObject(null);
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
      colorOverrides: {},
    };
    
    setPhases([firstPhase]);
    setActiveScene(initialScene);
  }, [setPhases]);

  const currentPhase = useMemo(() => phases[currentPhaseIndex], [phases, currentPhaseIndex]);
  const currentSubStep = useMemo(() => currentPhase?.subSteps[currentSubStepIndex], [currentPhase, currentSubStepIndex]);

  useEffect(() => {
    if (activeScene && currentSubStep && currentPhase) {
      applyTransforms(activeScene, currentSubStep.transforms);
      applyVisibility(activeScene, currentSubStep.visibility);
      applyColors(activeScene, currentPhase.colorOverrides, originalMaterials);
      setVersion(v => v + 1);
    }
  }, [currentSubStep, currentPhase, activeScene]);
  
  const selectedObjectNode = useMemo(() => {
    if (!activeScene || !selectedObject) return null;
    return activeScene.getObjectByName(selectedObject) ?? null;
  }, [activeScene, selectedObject]);

  const handleUpdateColor = useCallback((name: string, newColor: THREE.Color | null) => {
    const newColorHex = newColor ? `#${newColor.getHexString()}` : null;
    handleUpdatePhaseColor(name, newColorHex);
  }, [handleUpdatePhaseColor]);

  const handleHideSelected = () => {
    if (selectedObject) toggleVisibility(selectedObject);
  };

  const handleExport = useCallback(() => {
    if (phases.length === 0) {
      alert("No data to export.");
      return;
    }

    const serializablePhases = phases.map(phase => {
      const processedSubSteps = phase.subSteps.map(subStep => {
        const { transformHistory, ...restOfSubStep } = subStep;
        const serializableTransforms = Object.entries(restOfSubStep.transforms).reduce((acc, [key, transform]) => {
          acc[key] = {
            position: { x: transform.position.x, y: transform.position.y, z: transform.position.z },
            quaternion: { _x: transform.quaternion.x, _y: transform.quaternion.y, _z: transform.quaternion.z, _w: transform.quaternion.w },
            scale: { x: transform.scale.x, y: transform.scale.y, z: transform.scale.z },
          };
          return acc;
        }, {} as Record<string, any>);
        
        return {
          ...restOfSubStep,
          transforms: serializableTransforms,
        };
      });

      return {
        id: phase.id,
        name: phase.name,
        colorOverrides: phase.colorOverrides,
        subSteps: processedSubSteps,
      };
    });

    const dataToExport = {
      animationData: serializablePhases
    };
    
    try {
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
    } catch (error) {
        console.error("Something wrong when transfer to JSON:", error);
        alert("Error");
    }
  }, [phases]);

  const handlePrevPhase = useCallback(() => {
    const newIndex = currentPhaseIndex - 1;
    if (newIndex >= 0) {
      handlePhaseClick(newIndex);
    }
  }, [currentPhaseIndex, handlePhaseClick]);

  const handleNextPhase = useCallback(() => {
    const newIndex = currentPhaseIndex + 1;
    if (newIndex < phases.length) {
      handlePhaseClick(newIndex);
    }
  }, [currentPhaseIndex, phases.length, handlePhaseClick]);

  if (!activeScene) {
    return <FileUpload onSceneLoaded={handleSceneLoaded} />;
  }

  const currentPhaseColors = currentPhase?.colorOverrides || {};
  const selectedObjectColorHex = selectedObject ? currentPhaseColors[selectedObject] : null;
  const overrideColor = selectedObjectColorHex ? new THREE.Color(selectedObjectColorHex) : null;

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
        overrideColor={overrideColor}
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
          onPrevPhase={handlePrevPhase}
          onNextPhase={handleNextPhase}
        />
      </div>
    </div>
  );
}