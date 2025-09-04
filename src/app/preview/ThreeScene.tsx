"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import AnimatedModel from "./AnimatedModel";
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type Props = {
  animationData: any;
  phaseIndex: number;
  subStepIndex: number;
};

const CameraController = ({ scene }: { scene: THREE.Object3D }) => {
  const { controls } = useThree();
  const hasCentered = useRef(false);

  useEffect(() => {
    if (scene && controls && !hasCentered.current) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      
      const orbitControls = controls as OrbitControlsImpl;
      orbitControls.target.copy(center);
      orbitControls.update();
      
      hasCentered.current = true;
    }
  }, [scene, controls]);
  
  return null;
};

export default function ThreeScene({ animationData, phaseIndex, subStepIndex }: Props) {
  const { scene } = useGLTF("/ABB.glb");

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
      console.error("error reading camera:", error);
    }
    return { position: [0, 2, 6] };
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ ...initialCameraProps, fov: 50 }}>
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
          <CameraController scene={scene} />
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}