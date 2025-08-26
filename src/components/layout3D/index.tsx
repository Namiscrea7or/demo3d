"use client";

import { useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import Sidebar from "../sidebar/sidebar";
import InstructionPanel from "../instructions/instructsionBar";
import ThreeScene from "../threeScene/index";
import * as THREE from 'three';
import type { Object3D } from 'three';

export default function Layout3D() {
  const [steps] = useState([
    "Base",
    "Support Column",
    "Table Top",
    "Final Assembly",
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [scene, setScene] = useState<Object3D | null>(null);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  const { scene: loadedScene } = useGLTF("/ABB.glb");

  useEffect(() => {
    if (loadedScene) {
      const initialVisibility: Record<string, boolean> = {};
      loadedScene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          initialVisibility[object.name] = true;
        }
      });
      setVisibility(initialVisibility);
      setScene(loadedScene);
    }
  }, [loadedScene]);

  useEffect(() => {
    useGLTF.preload("/ABB.glb");
  }, []);

  const toggleVisibility = (name: string) => {
    if (!scene) return;
    
    const object = scene.getObjectByName(name);
    if (!object) return;

    const descendantMeshes: THREE.Mesh[] = [];
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        descendantMeshes.push(child);
      }
    });

    if (descendantMeshes.length === 0 && object instanceof THREE.Mesh) {
      descendantMeshes.push(object);
    }

    if (descendantMeshes.length === 0) return;

    const isCurrentlyVisible = visibility[descendantMeshes[0].name] ?? true;
    const newVisibilityState = !isCurrentlyVisible;

    const newVisibility = { ...visibility };
    descendantMeshes.forEach(mesh => {
      newVisibility[mesh.name] = newVisibilityState;
    });

    setVisibility(newVisibility);
  };

  const resetVisibility = () => {
    const allVisible: Record<string, boolean> = {};
    Object.keys(visibility).forEach(name => {
      allVisible[name] = true;
    });
    setVisibility(allVisible);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar 
        scene={scene}
        visibility={visibility}
        toggleVisibility={toggleVisibility}
        resetVisibility={resetVisibility}
      />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-gray-950">
          {scene && (
            <ThreeScene 
              scene={scene} 
              step={currentStep} 
              visibility={visibility} 
            />
          )}
        </div>
        <InstructionPanel steps={steps} />
      </div>
    </div>
  );
}