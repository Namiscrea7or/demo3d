"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, useProgress, Html } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import AnimatedModel from "./AnimatedModel";
import type { EnvironmentState } from '@/types';

type Props = {
  animationData: any;
  environment: EnvironmentState;
  phaseIndex: number;
  subStepIndex: number;
};

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(0)} % loaded</Html>
}

export default function ThreeScene({ animationData, environment, phaseIndex, subStepIndex }: Props) {
  const { scene } = useGLTF("/ship.glb");

  const initialCameraProps = useMemo(() => {
    try {
      const storedStateJSON = sessionStorage.getItem('previewCameraState');
      if (storedStateJSON) {
        const storedState = JSON.parse(storedStateJSON);
        if (storedState.position) {
          return { position: storedState.position };
        }
      }
    } catch (error) {
      console.error("Lỗi khi đọc trạng thái camera ban đầu:", error);
    }
    return { position: [0, 2, 6] };
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ ...initialCameraProps, fov: 50 }}>
        <color attach="background" args={['white']} />
        
        <ambientLight 
            color={environment.ambientLight.color} 
            intensity={environment.ambientLight.intensity} 
        />
        <directionalLight 
            color={environment.directionalLight.color} 
            intensity={environment.directionalLight.intensity} 
            position={environment.directionalLight.position}
        />
        
        <Suspense fallback={<Loader />}>
          <AnimatedModel
            scene={scene}
            animationData={animationData}
            phaseIndex={phaseIndex}
            subStepIndex={subStepIndex}
          />
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}