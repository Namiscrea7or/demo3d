"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Object3D } from 'three';

type ModelProps = {
  scene: Object3D;
  step: number;
  visibility: Record<string, boolean>;
};

const stepHighlightMap: { [key: string]: number } = {
  "Base": 0,
  "SupportColumn": 1,
  "TableTop": 2,
};

export default function Model({ scene, step, visibility }: ModelProps) {
  const highlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#4a90e2",
    emissive: "#2a508e",
    metalness: 0.8,
    roughness: 0.3,
  }), []);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.visible = visibility[object.name] ?? true;
        
        const highlightStep = stepHighlightMap[object.name];
        const isHighlighted = highlightStep === step;
        
        if (isHighlighted) {
          if (!object.userData.originalMaterial) {
            object.userData.originalMaterial = object.material;
          }
          object.material = highlightMaterial;
        } else {
          if (object.userData.originalMaterial) {
            object.material = object.userData.originalMaterial;
          }
        }
      }
    });
  }, [visibility, step, scene, highlightMaterial]);

  return <primitive object={scene} />;
}