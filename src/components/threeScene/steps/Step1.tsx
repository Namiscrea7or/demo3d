"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type Props = { scene: THREE.Object3D };

export default function Step1({ scene }: Props) {
  const modelRef = useRef<THREE.Object3D>(scene);

  useFrame(() => {
    if (!modelRef.current) return;
    modelRef.current.position.set(-2, 0, 0);
    modelRef.current.rotation.set(0, Math.PI / 2, 0);
  });

  return <primitive ref={modelRef} object={scene} scale={3} position={[0, -1, 0]} />;
}
