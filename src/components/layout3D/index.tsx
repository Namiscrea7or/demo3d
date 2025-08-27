"use client";

import { useState, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import Sidebar from "../sidebar/sidebar";
import ThreeScene from "../threeScene/index";
import ViewportToolbar from "../viewport/viewPort";
import InstructionPanel from "../instructions/instructsionBar";
import * as THREE from 'three';
import { useSpring, easings } from '@react-spring/three';
import type { Object3D, Vector3, Euler } from 'three';

type TransformState = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
};

type Step = {
  name: string;
  transforms: Record<string, TransformState>;
  visibility: Record<string, boolean>;
};

export default function Layout3D() {
  const [activeScene, setActiveScene] = useState<Object3D | null>(null);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'select' | 'translate' | 'rotate' | 'scale'>('translate');
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [version, setVersion] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { scene: loadedScene } = useGLTF("/ABB.glb");

  const [spring, api] = useSpring(() => ({
    stepIndex: 0,
  }));

  const extractTransforms = (scene: Object3D): Record<string, TransformState> => {
    const transforms: Record<string, TransformState> = {};
    scene.traverse(obj => {
      if (obj.name) {
        transforms[obj.name] = {
          position: obj.position.clone(),
          quaternion: obj.quaternion.clone(),
          scale: obj.scale.clone(),
        };
      }
    });
    return transforms;
  };

  const applyTransforms = (scene: Object3D, transforms: Record<string, TransformState>) => {
    scene.traverse(obj => {
      if (obj.name && transforms[obj.name]) {
        const t = transforms[obj.name];
        obj.position.copy(t.position);
        obj.quaternion.copy(t.quaternion);
        obj.scale.copy(t.scale);
        obj.updateMatrix();
      }
    });
    setVersion(v => v + 1);
  };

  useEffect(() => {
    if (loadedScene && steps.length === 0) {
      const initialScene = loadedScene.clone();
      const initialVisibility: Record<string, boolean> = {};
      initialScene.traverse(object => { 
        if (object instanceof THREE.Mesh) initialVisibility[object.name] = true; 
      });
      const initialTransforms = extractTransforms(initialScene);

      setVisibility(initialVisibility);
      setSteps([{ name: 'Step 1', transforms: initialTransforms, visibility: initialVisibility }]);
      setActiveScene(initialScene);
      setCurrentStep(0);
    }
  }, [loadedScene, steps.length]);

  useEffect(() => { 
    useGLTF.preload("/ABB.glb"); 
  }, []);

  const handleStepClick = (index: number) => {
    if (isAnimating || index < 0 || index >= steps.length || !activeScene) return;
    setCurrentStep(index);
    setVisibility(steps[index].visibility);
    applyTransforms(activeScene, steps[index].transforms);
    setSelectedObject(null);
  };

  const handleAddStep = () => {
    if (steps.length === 0 || !activeScene) return;
    const newTransforms = extractTransforms(activeScene);
    const newVisibility = { ...visibility };
    const newStep: Step = {
      name: `Step ${steps.length + 1}`,
      transforms: newTransforms,
      visibility: newVisibility,
    };
    setSteps(prevSteps => [...prevSteps, newStep]);
    setCurrentStep(steps.length);
    setSelectedObject(null);
  };
  
  useEffect(() => {
    if (isAnimating) {
      handleStepClick(0);
      setSelectedObject(null);

      api.start({
        from: { stepIndex: 0 },
        to: { stepIndex: steps.length - 1 },
        config: { duration: (steps.length - 1) * 1500, easing: easings.easeInOutCubic },
        onRest: () => {
          setIsAnimating(false);
          handleStepClick(steps.length - 1);
        },
      });
    }
  }, [isAnimating, steps.length, api]);

  const handleOnPlay = () => {
    if (steps.length <= 1 || !activeScene || isAnimating) return;
    setIsAnimating(true);
  };

  const updateObjectTransform = (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler, isFinal: boolean) => {
    if (!activeScene) return;
    const object = activeScene.getObjectByName(name);
    if (object) {
      if (prop === 'position') object.position.copy(value as Vector3);
      else if (prop === 'rotation') object.rotation.copy(value as Euler);
      else if (prop === 'scale') object.scale.copy(value as Vector3);
      object.updateMatrix();
      if (isFinal) {
        const t = { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() };
        setSteps(prev => {
          const newSteps = [...prev];
          newSteps[currentStep] = { ...newSteps[currentStep], transforms: { ...newSteps[currentStep].transforms, [name]: t } };
          return newSteps;
        });
        setVersion(v => v + 1);
      }
    }
  };

  const handleTransformChange = () => {
    if (!selectedObject || !activeScene) return;
    const obj = activeScene.getObjectByName(selectedObject);
    if (obj) {
      const t = { position: obj.position.clone(), quaternion: obj.quaternion.clone(), scale: obj.scale.clone() };
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[currentStep] = { ...newSteps[currentStep], transforms: { ...newSteps[currentStep].transforms, [selectedObject]: t }};
        return newSteps;
      });
    }
  };

  const handleTransformFinal = () => {
    setVersion(v => v + 1);
  };

  const handleSelectObject = (name: string | null) => {
    if (!isAnimating) {
      setSelectedObject(name);
    }
  };

  const selectedObjectNode = useMemo(() => {
    if (!activeScene || !selectedObject) return null;
    return activeScene.getObjectByName(selectedObject) ?? null;
  }, [activeScene, selectedObject]);

  const handleHideSelected = () => { if (selectedObject) toggleVisibility(selectedObject); };

  const toggleVisibility = (name: string) => {
    setVisibility(prev => {
      const newVis = { ...prev, [name]: !prev[name] };
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        newSteps[currentStep] = { ...newSteps[currentStep], visibility: newVis };
        return newSteps;
      });
      setVersion(v => v + 1);
      return newVis;
    });
  };

  const resetVisibility = () => {
    if (!activeScene) return;
    const newVis: Record<string, boolean> = {};
    activeScene.traverse(obj => { if (obj instanceof THREE.Mesh) newVis[obj.name] = true; });
    setVisibility(newVis);
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[currentStep] = { ...newSteps[currentStep], visibility: newVis };
      return newSteps;
    });
  };
  
  const handleUndo = () => console.log("Undo is disabled in Step mode.");
  const handleRedo = () => console.log("Redo is disabled in Step mode.");
  console.log("all the steps: ", steps)

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar
        scene={activeScene}
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
          {activeScene && (
            <ThreeScene
              scene={activeScene}
              visibility={visibility}
              selectedObjectNode={selectedObjectNode}
              transformMode={transformMode}
              onTransformChange={handleTransformChange}
              onTransformFinal={handleTransformFinal}
              onSelectObject={handleSelectObject}
              isAnimating={isAnimating}
              version={version}
              animationSpring={spring}
              steps={steps}
            />
          )}
        </div>
        <ViewportToolbar
          transformMode={transformMode}
          onSetTransformMode={setTransformMode}
          onHideSelected={handleHideSelected}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={false}
          canRedo={false}
        />
        <InstructionPanel
          steps={steps.map(s => s.name)}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          onAddStep={handleAddStep}
          onPlay={handleOnPlay}
        />
      </div>
    </div>
  );
}