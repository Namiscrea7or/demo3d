"use client";

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Object3D } from 'three';

const ANIMATION_DURATION = 0.5;

type Props = {
  scene: Object3D;
  animationData: any;
  phaseIndex: number;
  subStepIndex: number;
};

export default function AnimatedModel({ scene, animationData, phaseIndex, subStepIndex }: Props) {
  const previousStateRef = useRef({ phaseIndex, subStepIndex });
  const animationProgressRef = useRef(1);

  useEffect(() => {
    animationProgressRef.current = 0;

    return () => {
      previousStateRef.current = { phaseIndex, subStepIndex };
    };
  }, [subStepIndex, phaseIndex]);


  useFrame((state, delta) => {
    if (animationProgressRef.current >= 1) {
      const finalStepData = animationData[phaseIndex]?.subSteps[subStepIndex];
      if (!finalStepData) return;
      scene.traverse((child) => {
        const finalTransform = finalStepData.transforms[child.name];
        if (finalTransform) {
          child.position.set(finalTransform.position.x, finalTransform.position.y, finalTransform.position.z);
          child.quaternion.set(finalTransform.quaternion._x, finalTransform.quaternion._y, finalTransform.quaternion._z, finalTransform.quaternion._w);
          child.scale.set(finalTransform.scale.x, finalTransform.scale.y, finalTransform.scale.z);
        }
      });
      return;
    }

    animationProgressRef.current += delta / ANIMATION_DURATION;
    const progress = Math.min(animationProgressRef.current, 1);

    const { phaseIndex: prevPhaseIndex, subStepIndex: prevSubStepIndex } = previousStateRef.current;
    
    const fromStepData = animationData[prevPhaseIndex]?.subSteps[prevSubStepIndex];
    const toStepData = animationData[phaseIndex]?.subSteps[subStepIndex];

    if (!fromStepData || !toStepData) return;

    scene.traverse((child) => {
      const fromTransform = fromStepData.transforms[child.name];
      const toTransform = toStepData.transforms[child.name];

      if (fromTransform && toTransform) {
        const fromPos = new THREE.Vector3(fromTransform.position.x, fromTransform.position.y, fromTransform.position.z);
        const toPos = new THREE.Vector3(toTransform.position.x, toTransform.position.y, toTransform.position.z);
        child.position.lerpVectors(fromPos, toPos, progress);

        const fromQuat = new THREE.Quaternion(fromTransform.quaternion._x, fromTransform.quaternion._y, fromTransform.quaternion._z, fromTransform.quaternion._w);
        const toQuat = new THREE.Quaternion(toTransform.quaternion._x, toTransform.quaternion._y, toTransform.quaternion._z, toTransform.quaternion._w);
        child.quaternion.slerpQuaternions(fromQuat, toQuat, progress);
        
        const fromScale = new THREE.Vector3(fromTransform.scale.x, fromTransform.scale.y, fromTransform.scale.z);
        const toScale = new THREE.Vector3(toTransform.scale.x, toTransform.scale.y, toTransform.scale.z);
        child.scale.lerpVectors(fromScale, toScale, progress);
      }
      
      const toVisibility = toStepData.visibility[child.name] ?? true;
      if (child.visible !== toVisibility) {
        child.visible = toVisibility;
      }
    });
  });

  return <primitive object={scene} />;
}