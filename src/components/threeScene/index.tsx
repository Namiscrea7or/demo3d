"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Bounds, Grid, TransformControls } from "@react-three/drei";
import { EffectComposer, Outline } from "@react-three/postprocessing";
import Model from "./Model";
import * as THREE from 'three';
import type { Object3D, Scene, Camera } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type SubStep = {
  transforms: Record<string, any>;
  visibility: Record<string, boolean>;
};

type AnimationControllerProps = {
  scene: Object3D;
  isAnimating: boolean;
  animationSpring: any;
  animationSubSteps: SubStep[];
};

function AnimationController({ scene, isAnimating, animationSpring, animationSubSteps }: AnimationControllerProps) {
  const { invalidate } = useThree();
  useFrame(() => {
    if (!isAnimating || animationSubSteps.length <= 1) return;
    const currentVal = animationSpring.subStepIndex.get();
    const fromIndex = Math.floor(currentVal);
    const toIndex = Math.min(Math.ceil(currentVal), animationSubSteps.length - 1);
    const progress = currentVal - fromIndex;
    if (fromIndex === toIndex) return;
    const transformsA = animationSubSteps[fromIndex].transforms;
    const transformsB = animationSubSteps[toIndex].transforms;
    const visibilityA = animationSubSteps[fromIndex].visibility;
    const visibilityB = animationSubSteps[toIndex].visibility;
    scene.traverse(obj => {
      const tA = transformsA[obj.name];
      const tB = transformsB[obj.name];
      if (tA && tB) {
        obj.position.lerpVectors(tA.position, tB.position, progress);
        obj.quaternion.slerpQuaternions(tA.quaternion, tB.quaternion, progress);
        obj.scale.lerpVectors(tA.scale, tB.scale, progress);
      }
      if (obj instanceof THREE.Mesh) {
        const vA = visibilityA[obj.name] ?? true;
        const vB = visibilityB[obj.name] ?? true;
        obj.visible = progress < 0.5 ? vA : vB;
      }
    });
    invalidate();
  });
  return null;
}

type ThreeSceneProps = {
  scene: Object3D;
  visibility: Record<string, boolean>;
  selectedObjectNode: Object3D | null;
  transformMode: 'select' | 'translate' | 'rotate' | 'scale';
  onTransformStart: () => void;
  onTransformChange: () => void;
  onTransformFinal: () => void;
  onSelectObject: (name: string | null) => void;
  onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
  onSceneReady?: (scene: Scene) => void;
  onCameraReady?: (camera: Camera) => void;
  onControlsReady?: (controls: OrbitControlsImpl) => void;
  isAnimating: boolean;
  version: number;
  animationSpring: any;
  animationSubSteps: SubStep[];
  environmentProps: any;
};

function Invalidator({ version }: { version: number }) {
  const { invalidate } = useThree();
  useEffect(() => {
    invalidate();
  }, [version, invalidate]);
  return null;
}

function SceneConnector({ 
    onRendererReady, 
    onSceneReady,
    onCameraReady,
    onControlsReady,
    controlsRef
}: { 
    onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
    onSceneReady?: (scene: Scene) => void;
    onCameraReady?: (camera: Camera) => void;
    onControlsReady?: (controls: OrbitControlsImpl) => void;
    controlsRef: React.RefObject<OrbitControlsImpl>;
}) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (onRendererReady) onRendererReady(gl);
    if (onSceneReady) onSceneReady(scene);
    if (onCameraReady) onCameraReady(camera);
    if (onControlsReady && controlsRef.current) onControlsReady(controlsRef.current);
  }, [gl, scene, camera, controlsRef, onRendererReady, onSceneReady, onCameraReady, onControlsReady]);
  return null;
}

export default function ThreeScene({
  scene,
  visibility,
  selectedObjectNode,
  transformMode,
  onTransformStart,
  onTransformChange,
  onTransformFinal,
  onSelectObject,
  onRendererReady,
  onSceneReady,
  onCameraReady,
  onControlsReady,
  isAnimating,
  version,
  animationSpring,
  animationSubSteps,
  environmentProps,
}: ThreeSceneProps) {
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectedMeshes = useMemo(() => {
    if (!selectedObjectNode) return [];
    const meshes: THREE.Mesh[] = [];
    selectedObjectNode.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [selectedObjectNode]);

  return (
    <Canvas
      gl={{ 
        preserveDrawingBuffer: true,
      }}
      shadows
      camera={{ position: [4, 3, 6], fov: 45 }}
      style={{ background: '#435167' }}
      onPointerMissed={() => {
        if (!isDragging && !isAnimating) {
          onSelectObject(null);
        }
      }}
    >
      <Invalidator version={version} />
      <SceneConnector 
        onRendererReady={onRendererReady} 
        onSceneReady={onSceneReady} 
        onCameraReady={onCameraReady}
        onControlsReady={onControlsReady}
        controlsRef={orbitControlsRef}
      />
      
      <ambientLight 
        color={environmentProps.ambientLight.color} 
        intensity={environmentProps.ambientLight.intensity} 
      />
      <directionalLight 
        color={environmentProps.directionalLight.color} 
        intensity={environmentProps.directionalLight.intensity} 
        position={environmentProps.directionalLight.position as [number, number, number]}
        castShadow 
      />
      
      <Grid args={[100, 100]} cellSize={1} cellThickness={1.5} sectionSize={10} sectionThickness={1} cellColor="#888888" sectionColor="#888888" fadeDistance={80} fadeStrength={1} infiniteGrid />
      
      <Bounds fit clip observe margin={1.2}>
        <Model
            scene={scene}
            visibility={visibility}
            onSelectObject={onSelectObject}
        />
      </Bounds>
      
      {!isAnimating && selectedObjectNode && transformMode !== 'select' && (
        <TransformControls
          object={selectedObjectNode}
          mode={transformMode}
          onMouseDown={() => {
            setIsDragging(true);
            if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
            onTransformStart();
          }}
          onMouseUp={() => {
            setIsDragging(false);
            if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
            onTransformFinal();
          }}
          onObjectChange={onTransformChange}
        />
      )}
      <OrbitControls ref={orbitControlsRef} makeDefault />
      <AnimationController scene={scene} isAnimating={isAnimating} animationSpring={animationSpring} animationSubSteps={animationSubSteps} />
      <EffectComposer multisampling={8} autoClear={false}>
        <Outline
            selection={selectedMeshes}
            visibleEdgeColor={0x14b8a6}
            hiddenEdgeColor={0x14b8a6}
            edgeStrength={10}
            blur
        />
      </EffectComposer>
    </Canvas>
  );
}