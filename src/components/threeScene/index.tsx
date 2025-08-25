"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { Step0, Step1, Step2, Step3, Step4 } from "./steps";

type Props = { step: number };

function SceneContent({ step }: Props) {
  const { scene } = useGLTF("/ABB.glb");
  switch (step) {
    case 0:
      return <Step0 scene={scene} />;
    case 1:
      return <Step1 scene={scene} />;
    case 2:
      return <Step2 scene={scene} />;
    case 3:
      return <Step3 scene={scene} />;
    case 4:
      return <Step4 scene={scene} />;
    default:
      return <Step0 scene={scene} />;
  }
}

export default function ThreeScene({ step }: Props) {
  return (
    <div className="w-full h-full bg-white">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <SceneContent step={step} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
