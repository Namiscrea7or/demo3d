"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

type Props = { scene: THREE.Object3D };

export default function Step0({ scene }: Props) {
  const modelRef = useRef<THREE.Object3D>(scene);

  useFrame(() => {
    if (!modelRef.current) return;
    modelRef.current.position.set(0, 0, 0);
    modelRef.current.rotation.set(0, 0, 0);
  });

  return <primitive ref={modelRef} object={scene} scale={3} position={[0, -1, 0]} />;
}
