"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, Grid, TransformControls } from "@react-three/drei";
import Model from "./Model";
import * as THREE from 'three';
import type { Object3D, Vector3, Euler } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type ThreeSceneProps = {
  scene: Object3D;
  visibility: Record<string, boolean>;
  selectedObjectNode: Object3D | null;
  transformMode: 'select' | 'translate' | 'rotate' | 'scale';
  onUpdateTransform: (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler, isFinal: boolean) => void;
  onSelectObject: (name: string | null) => void;
};

export default function ThreeScene({ scene, visibility, selectedObjectNode, transformMode, onUpdateTransform, onSelectObject }: ThreeSceneProps) {
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  
  const handleTransformFinal = () => {
    if (!selectedObjectNode) return;
    
    switch (transformMode) {
      case 'translate':
        onUpdateTransform(selectedObjectNode.name, 'position', selectedObjectNode.position, true);
        break;
      case 'rotate':
        onUpdateTransform(selectedObjectNode.name, 'rotation', selectedObjectNode.rotation, true);
        break;
      case 'scale':
        onUpdateTransform(selectedObjectNode.name, 'scale', selectedObjectNode.scale, true);
        break;
      default:
        break;
    }
  };

  return (
    <Canvas
      shadows
      camera={{ position: [4, 3, 6], fov: 45 }}
      style={{ background: "#435167" }}
      onPointerMissed={() => onSelectObject(null)}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <Grid args={[100, 100]} cellSize={1} cellThickness={1.5} sectionSize={10} sectionThickness={1} cellColor="#ffffff" sectionColor="#ffffff" fadeDistance={80} fadeStrength={1} infiniteGrid />
      <axesHelper args={[10]} />
      <Bounds fit clip observe margin={1.2}>
        <Model 
            scene={scene} 
            visibility={visibility} 
            selectedObjectNode={selectedObjectNode} 
            onSelectObject={onSelectObject} 
        />
      </Bounds>
      {selectedObjectNode && transformMode !== 'select' && (
        <TransformControls 
          object={selectedObjectNode} 
          mode={transformMode}
          onMouseDown={() => orbitControlsRef.current && (orbitControlsRef.current.enabled = false)}
          onMouseUp={() => {
            orbitControlsRef.current && (orbitControlsRef.current.enabled = true);
            handleTransformFinal();
          }}
        />
      )}
      <OrbitControls ref={orbitControlsRef} makeDefault />
    </Canvas>
  );
}