"use client";

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Object3D, Vector3, Euler, PerspectiveCamera, WebGLRenderTarget, Scene, Camera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Phase, SubStep, TransformState } from '@/types';
import { extractTransforms } from '@/utils/transformUtils';
import * as THREE from 'three';
import { arrayMove } from '@dnd-kit/sortable';

const captureThumbnail = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  target: THREE.WebGLRenderTarget
): string => {
  try {
    scene.updateMatrixWorld(true);

    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);

    const buffer = new Uint8Array(target.width * target.height * 4);
    renderer.readRenderTargetPixels(target, 0, 0, target.width, target.height, buffer);

    renderer.setRenderTarget(null);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = target.width;
    tempCanvas.height = target.height;
    const ctx = tempCanvas.getContext('2d')!;
    
    const imageData = new ImageData(new Uint8ClampedArray(buffer), target.width, target.height);
    ctx.putImageData(imageData, 0, 0);

    const flipCanvas = document.createElement('canvas');
    flipCanvas.width = target.width;
    flipCanvas.height = target.height;
    const flipCtx = flipCanvas.getContext('2d')!;
    
    flipCtx.translate(0, target.height);
    flipCtx.scale(1, -1);
    flipCtx.drawImage(tempCanvas, 0, 0);

    return flipCanvas.toDataURL('image/jpeg', 0.7);

  } catch (error) {
    console.error("error thumbnail off-screen:", error);
    renderer.setRenderTarget(null);
    return '';
  }
};

export default function usePhaseManager(
  initialPhases: Phase[],
  mainThreeScene: Scene | null,
  gl: THREE.WebGLRenderer | undefined,
  thumbnailCamera: PerspectiveCamera | undefined,
  thumbnailTarget: WebGLRenderTarget | undefined,
  mainCamera: Camera | null,
  mainControls: OrbitControlsImpl | null
) {
  const [phases, setPhases] = useState<Phase[]>(initialPhases);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentSubStepIndex, setCurrentSubStepIndex] = useState(0);
  const [initialTransformState, setInitialTransformState] = useState<Record<string, TransformState> | null>(null);
  
  const captureCurrentCameraState = useCallback(() => {
    if (!mainCamera || !mainControls) return undefined;
    return {
      position: mainCamera.position.clone(),
      target: mainControls.target.clone()
    };
  }, [mainCamera, mainControls]);

  const currentVisibility = phases[currentPhaseIndex]?.subSteps[currentSubStepIndex]?.visibility || {};

  const handlePhaseClick = (phaseIndex: number) => {
    if (phaseIndex !== currentPhaseIndex) {
      if (!phases[phaseIndex]) return;
      setCurrentPhaseIndex(phaseIndex);
      setCurrentSubStepIndex(0);
    }
  };

  const handleSubStepClick = (phaseIndex: number, subStepIndex: number) => {
    if (phaseIndex !== currentPhaseIndex) {
      setCurrentPhaseIndex(phaseIndex);
    }
    if (!phases[phaseIndex]?.subSteps[subStepIndex]) return;
    setCurrentSubStepIndex(subStepIndex);
  };

  const handleAddPhase = () => {
    if (!mainThreeScene || phases.length === 0 || !gl || !thumbnailCamera || !thumbnailTarget) return;
    const defaultSubStep = phases[0]?.subSteps[0];
    if (!defaultSubStep) {
      console.error("Cannot find default state to create a new phase.");
      return;
    }
    const newTransforms = { ...defaultSubStep.transforms };
    const newVisibility = { ...defaultSubStep.visibility };
    const newThumbnail = captureThumbnail(gl, mainThreeScene, thumbnailCamera, thumbnailTarget);
    const newCameraState = captureCurrentCameraState();

    const newSubStep: SubStep = {
      id: uuidv4(),
      thumbnail: newThumbnail,
      cameraState: newCameraState,
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
    if (!mainThreeScene || !gl || !thumbnailCamera || !thumbnailTarget) return;
    const currentPhase = phases[phaseIndex];
    const lastSubStep = currentPhase?.subSteps[currentPhase.subSteps.length - 1];
    
    let newTransforms;
    if (lastSubStep) {
        newTransforms = lastSubStep.transforms;
    } else if (mainThreeScene) {
        const model = mainThreeScene.children.find(child => child.type !== 'Grid' && child.type !== 'AxesHelper' && child.type.includes('Light') === false && child.type.includes('Camera') === false);
        if (model) {
            newTransforms = extractTransforms(model);
        } else {
            newTransforms = {};
        }
    } else {
        newTransforms = {};
    }

    const newVisibility = lastSubStep?.visibility || {};
    const newThumbnail = captureThumbnail(gl, mainThreeScene, thumbnailCamera, thumbnailTarget);
    const newCameraState = captureCurrentCameraState();

    const newSubStep: SubStep = {
      id: uuidv4(),
      thumbnail: newThumbnail,
      cameraState: newCameraState,
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

  const handleDeletePhase = (phaseIndexToDelete: number) => {
    if (phaseIndexToDelete === 0) {
      alert("You need a least one animation!!!")
      return;
    }
    const phaseNameToDelete = phases[phaseIndexToDelete]?.name || 'this phase';
    if (!window.confirm(`Are you sure you want to delete "${phaseNameToDelete}"?`)) {
      return;
    }

    setPhases(prev => {
      const newPhases = prev.filter((_, index) => index !== phaseIndexToDelete);
      if (currentPhaseIndex >= phaseIndexToDelete) {
        setCurrentPhaseIndex(Math.max(0, currentPhaseIndex - 1));
      }
      return newPhases;
    });
  };

  const handleDeleteStep = (phaseIndex: number, subStepIndexToDelete: number) => {
    if (phases[phaseIndex]?.subSteps.length <= 1) {
      alert("Cannot delete the last step in a phase.");
      return;
    }

    setPhases(prev => prev.map((phase, pIndex) => {
      if (pIndex !== phaseIndex) return phase;

      const newSubSteps = phase.subSteps.filter((_, sIndex) => sIndex !== subStepIndexToDelete);
      if (currentPhaseIndex === phaseIndex && currentSubStepIndex >= subStepIndexToDelete) {
        setCurrentSubStepIndex(Math.max(0, currentSubStepIndex - 1));
      }
      return { ...phase, subSteps: newSubSteps };
    }));
  };

  const handleReorderPhases = (oldIndex: number, newIndex: number) => {
    setPhases(prev => {
      const newPhases = arrayMove(prev, oldIndex, newIndex);
      if (currentPhaseIndex === oldIndex) {
        setCurrentPhaseIndex(newIndex);
      } else if (oldIndex < currentPhaseIndex && newIndex >= currentPhaseIndex) {
        setCurrentPhaseIndex(currentPhaseIndex - 1);
      } else if (oldIndex > currentPhaseIndex && newIndex <= currentPhaseIndex) {
        setCurrentPhaseIndex(currentPhaseIndex + 1);
      }
      return newPhases;
    });
  };

  const handleReorderSteps = (phaseIndex: number, oldIndex: number, newIndex: number) => {
    setPhases(prev => prev.map((phase, pIndex) => {
      if (pIndex !== phaseIndex) return phase;

      const newSubSteps = arrayMove(phase.subSteps, oldIndex, newIndex);
      if (currentPhaseIndex === phaseIndex) {
        if (currentSubStepIndex === oldIndex) {
          setCurrentSubStepIndex(newIndex);
        } else if (oldIndex < currentSubStepIndex && newIndex >= currentSubStepIndex) {
          setCurrentSubStepIndex(currentSubStepIndex - 1);
        } else if (oldIndex > currentSubStepIndex && newIndex <= currentSubStepIndex) {
          setCurrentSubStepIndex(currentSubStepIndex + 1);
        }
      }
      return { ...phase, subSteps: newSubSteps };
    }));
  };

  const updateCurrentSubStep = useCallback((updater: (subStep: SubStep) => SubStep) => {
    setPhases(prev => prev.map((phase, pIndex) => {
      if (pIndex !== currentPhaseIndex) return phase;
      const newSubSteps = phase.subSteps.map((subStep, sIndex) =>
        sIndex === currentSubStepIndex ? updater(subStep) : subStep
      );
      return { ...phase, subSteps: newSubSteps };
    }));
  }, [currentPhaseIndex, currentSubStepIndex]);

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
    if (initialTransformState && gl && mainThreeScene && thumbnailCamera && thumbnailTarget) {
      const newThumbnail = captureThumbnail(gl, mainThreeScene, thumbnailCamera, thumbnailTarget);
      const newCameraState = captureCurrentCameraState();
      updateCurrentSubStep(subStep => ({
        ...subStep,
        thumbnail: newThumbnail,
        cameraState: newCameraState,
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
    if (!mainThreeScene) return;
    const newVis: Record<string, boolean> = {};
    mainThreeScene.traverse(obj => { if (obj instanceof THREE.Mesh) newVis[obj.name] = true; });
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
      const newThumbnail = (gl && mainThreeScene && thumbnailCamera && thumbnailTarget) ? captureThumbnail(gl, mainThreeScene, thumbnailCamera, thumbnailTarget) : undefined;
      const newCameraState = captureCurrentCameraState();
      updateCurrentSubStep(subStep => ({
        ...subStep,
        transforms: newTransforms,
        thumbnail: newThumbnail ?? subStep.thumbnail,
        cameraState: newCameraState ?? subStep.cameraState,
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
    handleDeletePhase,
    handleDeleteStep,
    handleReorderPhases,
    handleReorderSteps,
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