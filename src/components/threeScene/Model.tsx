"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Object3D } from 'three';

type ModelProps = {
  scene: Object3D;
  visibility: Record<string, boolean>;
  selectedObjectNode: Object3D | null;
  onSelectObject: (name: string | null) => void;
};

export default function Model({ scene, visibility, selectedObjectNode, onSelectObject }: ModelProps) {
  const selectionMaterial = useMemo(() => new THREE.MeshStandardMaterial({
      color: "#2dd4bf",
      emissive: "#14b8a6",
  }), []);
  
  useEffect(() => {
    if (!scene) return;

    const selectedMeshes = new Set<string>();
    if (selectedObjectNode) {
        selectedObjectNode.traverse((child) => { if (child instanceof THREE.Mesh) selectedMeshes.add(child.name); });
    }

    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.visible = visibility[object.name] ?? true;
        if (object.userData.originalMaterial === undefined) object.userData.originalMaterial = object.material;
        
        const isSelected = selectedMeshes.has(object.name);

        if (isSelected) {
            object.material = selectionMaterial;
        } else {
            object.material = object.userData.originalMaterial;
        }
      }
    });
  }, [visibility, scene, selectedObjectNode, selectionMaterial]);

  return <primitive object={scene} onClick={(e: any) => { e.stopPropagation(); onSelectObject(e.object.name); }} />;
}