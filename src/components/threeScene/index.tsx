"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, Grid } from "@react-three/drei";
import Model from "./Model";
import type { Object3D } from 'three';

type ThreeSceneProps = {
  scene: Object3D;
  step: number;
  visibility: Record<string, boolean>;
};

export default function ThreeScene({ scene, step, visibility }: ThreeSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [4, 3, 6], fov: 45 }}
      style={{ background: "#435167" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />

      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={1.5}
        sectionSize={10}
        sectionThickness={1}
        cellColor="#ffffff"
        sectionColor="#ffffff"
        fadeDistance={80}
        fadeStrength={1}
        infiniteGrid
      />

      <axesHelper args={[10]} />

      <Suspense fallback={null}>
        <Bounds fit clip observe margin={1.2}>
          <Model scene={scene} step={step} visibility={visibility} />
        </Bounds>
      </Suspense>

      <OrbitControls makeDefault />
    </Canvas>
  );
}