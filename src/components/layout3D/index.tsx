"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import Sidebar from "../sidebar/sidebar";
import ThreeScene from "../threeScene/index";
import ViewportToolbar from "../viewport/viewPort";
import InstructionPanel from "../instructions/instructsionBar";
import * as THREE from 'three';
import type { Object3D, Vector3, Euler } from 'three';

type TransformState = { position: Vector3, rotation: Euler, scale: Vector3 };
type HistoryState = Map<string, TransformState>;

export default function Layout3D() {
  const [scene, setScene] = useState<Object3D | null>(null);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'select' | 'translate' | 'rotate' | 'scale'>('translate');
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [steps, setSteps] = useState<string[]>(['Step 1']);
  const [currentStep, setCurrentStep] = useState(0);

  const { scene: loadedScene } = useGLTF("/ABB.glb");

  const takeSnapshot = useCallback((scene: Object3D): HistoryState => {
    const snapshot: HistoryState = new Map();
    scene.traverse(obj => {
      snapshot.set(obj.name, {
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone(),
      });
    });
    return snapshot;
  }, []);

  const applySnapshot = useCallback((scene: Object3D, snapshot: HistoryState) => {
    scene.traverse(obj => {
      const state = snapshot.get(obj.name);
      if (state) {
        obj.position.copy(state.position);
        obj.rotation.copy(state.rotation);
        obj.scale.copy(state.scale);
      }
    });
    setScene(scene.clone());
  }, []);

  const pushHistory = useCallback((newScene: Object3D) => {
    const newSnapshot = takeSnapshot(newScene);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newSnapshot]);
    setHistoryIndex(newHistory.length);
  }, [history, historyIndex, takeSnapshot]);

  useEffect(() => {
    if (loadedScene && history.length === 0) {
      const initialVisibility: Record<string, boolean> = {};
      loadedScene.traverse(object => { if (object instanceof THREE.Mesh) initialVisibility[object.name] = true; });
      setVisibility(initialVisibility);
      setScene(loadedScene);

      const initialSnapshot = takeSnapshot(loadedScene);
      setHistory([initialSnapshot]);
      setHistoryIndex(0);
    }
  }, [loadedScene, takeSnapshot, history.length]);

  useEffect(() => { useGLTF.preload("/ABB.glb"); }, []);

  const handleUndo = () => {
    if (historyIndex > 0 && scene) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      applySnapshot(scene, history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && scene) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      applySnapshot(scene, history[newIndex]);
    }
  };

  const handleSelectObject = (name: string | null) => {
    if (name === null) {
      setSelectedObject(null);
      return;
    }
    setSelectedObject(prev => prev === name ? null : name);
  };

  const updateObjectTransform = (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler, isFinal: boolean) => {
    if (!scene) return;
    const object = scene.getObjectByName(name);
    if (object) {
      object[prop].copy(value as any);
      if (isFinal) {
        pushHistory(scene);
      } else {
        setScene(scene.clone());
      }
    }
  };

  const handleHideSelected = () => { if (selectedObject) toggleVisibility(selectedObject); };

  const toggleVisibility = (name: string) => {
    if (!scene) return;
    const object = scene.getObjectByName(name);
    if (!object) return;
    const descendantMeshes: THREE.Mesh[] = [];
    object.traverse((child) => { if (child instanceof THREE.Mesh) descendantMeshes.push(child); });
    if (descendantMeshes.length === 0 && object instanceof THREE.Mesh) descendantMeshes.push(object);
    if (descendantMeshes.length === 0) return;
    const isCurrentlyVisible = visibility[descendantMeshes[0].name] ?? true;
    const newVisibilityState = !isCurrentlyVisible;
    const newVisibility = { ...visibility };
    descendantMeshes.forEach(mesh => { newVisibility[mesh.name] = newVisibilityState; });
    setVisibility(newVisibility);
  };

  const resetVisibility = () => {
    const allVisible: Record<string, boolean> = {};
    Object.keys(visibility).forEach(name => { allVisible[name] = true; });
    setVisibility(allVisible);
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleAddStep = () => {
    setSteps(prev => [...prev, `Step ${prev.length + 1}`]);
  };

  const handleOnPlay = () => {
    console.log("2")
  }

  const selectedObjectNode = useMemo(() => scene && selectedObject ? scene.getObjectByName(selectedObject) || null : null, [scene, selectedObject]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        scene={scene}
        visibility={visibility}
        toggleVisibility={toggleVisibility}
        resetVisibility={resetVisibility}
        selectedObject={selectedObject}
        onSelectObject={handleSelectObject}
        selectedObjectNode={selectedObjectNode}
        onUpdateTransform={updateObjectTransform}
      />
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 bg-gray-950">
          {scene && (
            <ThreeScene
              scene={scene}
              visibility={visibility}
              selectedObjectNode={selectedObjectNode}
              transformMode={transformMode}
              onUpdateTransform={updateObjectTransform}
              onSelectObject={handleSelectObject}
            />
          )}
        </div>
        <ViewportToolbar
          transformMode={transformMode}
          onSetTransformMode={setTransformMode}
          onHideSelected={handleHideSelected}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
        <InstructionPanel
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          onAddStep={handleAddStep}
          onPlay={handleOnPlay}
        />
      </div>
    </div>
  );
}