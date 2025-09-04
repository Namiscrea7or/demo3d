"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import AnimatedModel from "./AnimatedModel";

type Props = {
  animationData: any;
  phaseIndex: number;
  subStepIndex: number;
};

export default function ThreeScene({ animationData, phaseIndex, subStepIndex }: Props) {
  const { scene } = useGLTF("/ABB.glb");

  return (
    <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
      <color attach="background" args={['white']} />
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <Suspense fallback={null}>
        <AnimatedModel
          scene={scene}
          animationData={animationData}
          phaseIndex={phaseIndex}
          subStepIndex={subStepIndex}
        />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}