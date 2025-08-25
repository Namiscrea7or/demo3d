"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = { scene: THREE.Object3D };

export default function Step4({ scene }: Props) {
  const modelRef = useRef<THREE.Object3D>(scene);
  const targetMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.name.includes("Imported1")) {
        targetMeshRef.current = child;
        child.material = child.material.clone();
        child.userData.originalPosition = child.position.clone();
      }
    });

    const animate = () => {
      if (targetMeshRef.current) {
        const mat = targetMeshRef.current.material as THREE.MeshStandardMaterial;
        mat.color.set("red");

        const t = Date.now() * 0.002;
        const orig = targetMeshRef.current.userData.originalPosition as THREE.Vector3;

        targetMeshRef.current.position.set(
          orig.x + Math.sin(t) * 5,
          orig.y,
          orig.z
        );
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, [scene]);

  return <primitive ref={modelRef} object={scene} scale={3} position={[0, -1, 0]} />;
}
