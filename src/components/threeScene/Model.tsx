"use client";

import { useEffect, FC } from "react";
import * as THREE from "three";
import type { Object3D } from 'three';

type ModelProps = {
  scene: Object3D;
  visibility: Record<string, boolean>;
  onSelectObject: (name: string | null) => void;
};

export default function Model({ scene, visibility, onSelectObject }: ModelProps) {
  useEffect(() => {
    if (!scene) return;

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.visible = visibility[object.name] ?? true;
      }
    });
  }, [visibility, scene]);

  return (
    <primitive 
        object={scene} 
        onClick={(e: any) => { 
            e.stopPropagation(); 
            onSelectObject(e.object.name); 
        }} 
    />
  );
}