"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Object3D, Material, Scene, Camera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import Sidebar from "../sidebar/sidebar";
import ThreeScene from "../threeScene/index";
import ViewportToolbar from "../viewport/viewPort";
import InstructionPanel from "../instructions/index";
import FileUpload from "../FileUpload";
import TopBar from "./TopBar";
import usePhaseManager from "@/hooks/usePhaseManager";
import useAnimationManager from "@/hooks/useAnimationManager";
import { applyTransforms, extractTransforms } from "@/utils/transformUtils";
import { exportAndCompressAnimation, prepareDataForPreview } from "@/utils/exportUtils"; 
import type { Phase, EnvironmentState } from '@/types';

const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 150;

const applyVisibility = (scene: Object3D, visibility: Record<string, boolean>) => {
  scene.traverse(obj => { if (obj instanceof THREE.Mesh) obj.visible = visibility[obj.name] ?? true; });
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
        if (!originalMaterials.current.has(child.uuid)) originalMaterials.current.set(child.uuid, child.material);
        const newColor = new THREE.Color(newColorHex);
        if (Array.isArray(child.material)) {
          child.material = child.material.map(m => { const newMat = m.clone(); newMat.color.set(newColor); return newMat; });
        } else {
          child.material = child.material.clone(); (child.material as any).color.set(newColor);
        }
      }
    }
  });
};

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  event.returnValue = '';
};

export default function Layout3D() {
  const [activeScene, setActiveScene] = useState<Object3D | null>(null);
  const [mainThreeScene, setMainThreeScene] = useState<Scene | null>(null);
  const [mainCamera, setMainCamera] = useState<Camera | null>(null);
  const [mainControls, setMainControls] = useState<OrbitControlsImpl | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'select' | 'translate' | 'rotate' | 'scale'>('translate');
  const [version, setVersion] = useState(0);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | undefined>(undefined);

  const [environmentState, setEnvironmentState] = useState<EnvironmentState>({
    ambientLight: { color: '#ffffff', intensity: 0.3 },
    directionalLight: { color: '#ffffff', intensity: 1.5, position: [5, 5, 5] },
  });

  const originalMaterials = useRef(new Map<string, Material | Material[]>());

  const thumbnailTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  }, []);

  const thumbnailCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(50, THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT, 0.1, 100);
    cam.position.set(5, 4, 7);
    cam.lookAt(0, 1, 0);
    return cam;
  }, []);

  const {
    phases, setPhases, currentPhaseIndex, currentSubStepIndex, currentVisibility,
    handlePhaseClick, handleSubStepClick, handleAddPhase, handleAddSubStep,
    handleDeletePhase, handleDeleteStep, handleReorderPhases, handleReorderSteps,
    handleUpdatePhaseColor, handleTransformStart, handleTransformChange, handleTransformFinal,
    handleUndo, handleRedo, toggleVisibility, resetVisibility, handleUpdateTransformFromSidebar,
    canUndo, canRedo,
  } = usePhaseManager(
      [], 
      mainThreeScene, 
      renderer,
      thumbnailCamera,
      thumbnailTarget,
      mainCamera,
      mainControls
  );

  useEffect(() => {
    const hasUnsavedData = phases.length > 1 || (phases.length === 1 && phases[0].subSteps.length > 1);
    if (hasUnsavedData) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phases]);

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
        thumbnail: undefined,
        transforms: extractTransforms(initialScene),
        visibility: (() => { const vis: Record<string, boolean> = {}; initialScene.traverse(o => { if (o instanceof THREE.Mesh) vis[o.name] = true; }); return vis; })(),
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
    if (mainThreeScene && renderer && thumbnailCamera && thumbnailTarget && phases.length === 1 && phases[0].subSteps.length === 1 && !phases[0].subSteps[0].thumbnail) {
      setTimeout(() => {
        const newThumbnail = (gl: any, scene: any, cam: any, target: any) => {
            scene.updateMatrixWorld(true);
            gl.setRenderTarget(target);
            gl.clear();
            gl.render(scene, cam);
            gl.setRenderTarget(null);
            const buffer = new Uint8Array(target.width * target.height * 4);
            gl.readRenderTargetPixels(target, 0, 0, target.width, target.height, buffer);
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
        };
        const initialThumbnail = newThumbnail(renderer, mainThreeScene, thumbnailCamera, thumbnailTarget);

        setPhases(prevPhases => {
            const newPhases = [...prevPhases];
            newPhases[0] = {
            ...newPhases[0],
            subSteps: [{
                ...newPhases[0].subSteps[0],
                thumbnail: initialThumbnail,
            }],
            };
            return newPhases;
        });
      }, 100);
    }
  }, [mainThreeScene, renderer, phases, setPhases, thumbnailCamera, thumbnailTarget]);

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

  const handleHideSelected = () => { if (selectedObject) toggleVisibility(selectedObject); };

  const handleExport = useCallback(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    exportAndCompressAnimation(phases, environmentState);
    setTimeout(() => {
        const hasUnsavedData = phases.length > 1 || (phases.length === 1 && phases[0].subSteps.length > 1);
        if (hasUnsavedData) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }
    }, 1000);
  }, [phases, environmentState]);

  const handlePreview = useCallback(() => {
    const previewData = prepareDataForPreview(phases, environmentState);
    try {
      sessionStorage.setItem('previewAnimationData', JSON.stringify(previewData));

      if (mainCamera && mainControls) {
        const cameraState = {
          position: mainCamera.position.toArray(),
          target: mainControls.target.toArray(),
        };
        sessionStorage.setItem('previewCameraState', JSON.stringify(cameraState));
      }

      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.location.href = '/preview';
    } catch (error) {
      console.error("Lỗi khi chuẩn bị dữ liệu preview:", error);
      alert("Dữ liệu animation quá lớn để xem trước. Vui lòng giảm bớt số step hoặc thumbnail.");
    }
  }, [phases, environmentState, mainCamera, mainControls]);

  const handlePrevPhase = useCallback(() => {
    const newIndex = currentPhaseIndex - 1;
    if (newIndex >= 0) handlePhaseClick(newIndex);
  }, [currentPhaseIndex, handlePhaseClick]);

  const handleNextPhase = useCallback(() => {
    const newIndex = currentPhaseIndex + 1;
    if (newIndex < phases.length) handlePhaseClick(newIndex);
  }, [currentPhaseIndex, phases.length, handlePhaseClick]);

  if (!activeScene) return <FileUpload onSceneLoaded={handleSceneLoaded} />;

  const currentPhaseColors = currentPhase?.colorOverrides || {};
  const selectedObjectColorHex = selectedObject ? currentPhaseColors[selectedObject] : null;
  const overrideColor = selectedObjectColorHex ? new THREE.Color(selectedObjectColorHex) : null;
  
  const environmentProps = {
    environmentState, setEnvironmentState
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
        overrideColor={overrideColor} 
        onUpdateColor={handleUpdateColor}
        environmentProps={environmentProps}
      />
      
      <div className="flex-1 flex flex-col min-h-0">
        <TopBar onExport={handleExport} onPreview={handlePreview} />

        <div className="flex-1 relative min-h-0 bg-black">
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
            onRendererReady={setRenderer} 
            onSceneReady={setMainThreeScene}
            onCameraReady={setMainCamera}
            onControlsReady={setMainControls}
            environmentProps={environmentProps}
          />
          <ViewportToolbar transformMode={transformMode} onSetTransformMode={setTransformMode} onHideSelected={handleHideSelected} onUndo={handleUndo} onRedo={handleRedo} canUndo={canUndo} canRedo={canRedo} />
        </div>
        
        <div className="bg-slate-800 p-4 border-t border-slate-700">
          <InstructionPanel
            phases={phases}
            currentPhaseIndex={currentPhaseIndex}
            currentSubStepIndex={currentSubStepIndex}
            onPhaseClick={handlePhaseClick}
            onSubStepClick={handleSubStepClick}
            onAddPhase={handleAddPhase}
            onAddSubStep={handleAddSubStep}
            onPlay={handleOnPlay}
            onPrevPhase={handlePrevPhase}
            onNextPhase={handleNextPhase}
            onDeletePhase={handleDeletePhase}
            onDeleteStep={handleDeleteStep}
            onReorderPhases={handleReorderPhases}
            onReorderSteps={handleReorderSteps}
          />
        </div>
      </div>
    </div>
  );
}