"use client";

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Object3D, Vector3, Euler } from 'three';
import type { Phase, SubStep, TransformState } from '@/types';
import { extractTransforms } from '@/utils/transformUtils';
import * as THREE from 'three';

export default function usePhaseManager(initialPhases: Phase[], activeScene: Object3D | null) {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [initialTransformState, setInitialTransformState] = useState<Record<string, TransformState> | null>(null);

  const currentVisibility = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex]?.visibility || {};

  const updateCurrentSubStep = useCallback((updater: (subStep: SubStep) => SubStep) => {
    setPhases(prev => prev.map((phase, pIndex) => {
      if (pIndex !== currentPhaseIndex) return phase;
      const newSubSteps = phase.subSteps.map((subStep, sIndex) =>
        sIndex === currentSubStepIndex ? updater(subStep) : subStep
      );
      return { ...phase, subSteps: newSubSteps };
    }));
  }, [currentPhaseIndex, currentSubStepIndex]);

  const handlePhaseClick = (phaseIndex: number) => {
    if (phaseIndex !== currentPhaseIndex) {
      const targetPhase = phases[phaseIndex];
      if (!targetPhase) return;
      setCurrentPhaseIndex(phaseIndex);
      setCurrentSubStepIndex(0);
    }
  };

  const handleSubStepClick = (phaseIndex: number, subStepIndex: number) => {
    if (phaseIndex !== currentPhaseIndex) {
      setCurrentPhaseIndex(phaseIndex);
    }
    const targetPhase = phases[phaseIndex];
    if (!targetPhase?.subSteps[subStepIndex]) return;
    setCurrentSubStepIndex(subStepIndex);
  };

  const handleAddPhase = () => {
    if (!activeScene || phases.length === 0) return;

    const defaultSubStep = phases[0]?.subSteps[0];

    if (!defaultSubStep) {
        console.error("Không thể tìm thấy trạng thái mặc định để tạo phase mới.");
        return;
    }

    const newTransforms = { ...defaultSubStep.transforms };
    const newVisibility = { ...defaultSubStep.visibility };

    const newSubStep: SubStep = {
      id: uuidv4(),
      transforms: newTransforms,
      visibility: newVisibility,
      transformHistory: { past: [], future: [] },
    };

    const newPhase: Phase = {
      id: uuidv4(),
      name: `Phase ${phases.length + 1}`,
      subSteps: [newSubStep],
      colorOverrides: {},
    };

    setPhases(prev => [...prev, newPhase]);
    setCurrentPhaseIndex(phases.length);
    setCurrentSubStepIndex(0);
  };

  const handleAddSubStep = (phaseIndex: number) => {
    if (!activeScene) return;
    const currentPhase = phases[phaseIndex];
    const lastSubStep = currentPhase?.subSteps[currentPhase.subSteps.length - 1];
    const newTransforms = lastSubStep?.transforms || extractTransforms(activeScene);
    const newVisibility = lastSubStep?.visibility || {};

    const newSubStep: SubStep = {
      id: uuidv4(),
      transforms: newTransforms,
      visibility: newVisibility,
      transformHistory: { past: [], future: [] },
    };

    const newSubStepIndex = phases[phaseIndex].subSteps.length;
    setPhases(prev => prev.map((phase, index) =>
      index === phaseIndex
        ? { ...phase, subSteps: [...phase.subSteps, newSubStep] }
        : phase
    ));
    setCurrentSubStepIndex(newSubStepIndex);
  };
  
  const handleUpdatePhaseColor = (name: string, newColorHex: string | null) => {
      setPhases(prev => prev.map((phase, pIndex) => {
          if (pIndex !== currentPhaseIndex) return phase;
          const newOverrides = { ...phase.colorOverrides };
          if (newColorHex) {
              newOverrides[name] = newColorHex;
          } else {
              delete newOverrides[name];
          }
          return { ...phase, colorOverrides: newOverrides };
      }));
  };

  const handleTransformStart = () => {
    const currentSubStep = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex];
    if (currentSubStep) {
      setInitialTransformState(currentSubStep.transforms);
    }
  };

  const handleTransformChange = (selectedObject: string | null, scene: Object3D) => {
    if (!selectedObject || !scene) return;
    const obj = scene.getObjectByName(selectedObject);
    if (obj) {
      const t = { position: obj.position.clone(), quaternion: obj.quaternion.clone(), scale: obj.scale.clone() };
      updateCurrentSubStep(subStep => ({
        ...subStep,
        transforms: { ...subStep.transforms, [selectedObject]: t },
      }));
    }
  };

  const handleTransformFinal = () => {
    if (initialTransformState) {
      updateCurrentSubStep(subStep => ({
        ...subStep,
        transformHistory: {
          past: [...subStep.transformHistory.past, initialTransformState],
          future: [],
        },
      }));
      setInitialTransformState(null);
    }
  };

  const handleUndo = () => {
    const subStep = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex];
    if (!subStep || subStep.transformHistory.past.length === 0) return;
    const previousTransforms = subStep.transformHistory.past.slice(-1)[0];
    
    updateCurrentSubStep(ss => ({
      ...ss,
      transforms: previousTransforms,
      transformHistory: {
        past: ss.transformHistory.past.slice(0, -1),
        future: [ss.transforms, ...ss.transformHistory.future],
      },
    }));
  };

  const handleRedo = () => {
    const subStep = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex];
    if (!subStep || subStep.transformHistory.future.length === 0) return;
    const nextTransforms = subStep.transformHistory.future[0];

    updateCurrentSubStep(ss => ({
      ...ss,
      transforms: nextTransforms,
      transformHistory: {
        past: [...ss.transformHistory.past, ss.transforms],
        future: ss.transformHistory.future.slice(1),
      },
    }));
  };

  const toggleVisibility = (name: string) => {
    const newVis = { ...currentVisibility, [name]: !currentVisibility[name] };
    updateCurrentSubStep(subStep => ({ ...subStep, visibility: newVis }));
  };

  const resetVisibility = () => {
    if (!activeScene) return;
    const newVis: Record<string, boolean> = {};
    activeScene.traverse(obj => { if (obj instanceof THREE.Mesh) newVis[obj.name] = true; });
    updateCurrentSubStep(subStep => ({ ...subStep, visibility: newVis }));
  };
  
  const handleUpdateTransformFromSidebar = (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler, isFinal: boolean) => {
    const currentSubStep = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex];
    if (!currentSubStep) return;

    const oldTransforms = currentSubStep.transforms;
    const newTransforms = { ...oldTransforms };
    const targetTransform = { ...(newTransforms[name] || { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3(1, 1, 1) }) };

    if (prop === 'position' && value instanceof THREE.Vector3) targetTransform.position.copy(value);
    else if (prop === 'rotation' && value instanceof THREE.Euler) targetTransform.quaternion.setFromEuler(value);
    else if (prop === 'scale' && value instanceof THREE.Vector3) targetTransform.scale.copy(value);

    newTransforms[name] = targetTransform;
    
    if (isFinal) {
      updateCurrentSubStep(subStep => ({
        ...subStep,
        transforms: newTransforms,
        transformHistory: {
          past: [...subStep.transformHistory.past, oldTransforms],
          future: [],
        },
      }));
    } else {
      updateCurrentSubStep(subStep => ({
        ...subStep,
        transforms: newTransforms,
      }));
    }
  };

  const canUndo = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex]?.transformHistory.past.length > 0;
  const canRedo = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex]?.transformHistory.future.length > 0;

  return {
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
  };
}