"use client";

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Object3D } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const ANIMATION_DURATION = 0.5;

type Props = {
  scene: Object3D;
  animationData: any;
  phaseIndex: number;
  subStepIndex: number;
};

const fromPos = new THREE.Vector3();
const toPos = new THREE.Vector3();
const fromTarget = new THREE.Vector3();
const toTarget = new THREE.Vector3();
const fromQuat = new THREE.Quaternion();
const toQuat = new THREE.Quaternion();
const fromScale = new THREE.Vector3();
const toScale = new THREE.Vector3();
const fromColor = new THREE.Color();
const toColor = new THREE.Color();

export default function AnimatedModel({ scene, animationData, phaseIndex, subStepIndex }: Props) {
  const { camera, controls } = useThree();
  const orbitControls = controls as OrbitControlsImpl | undefined;

  const animationProgressRef = useRef(1);
  const previousStateRef = useRef({ phaseIndex, subStepIndex });
  const originalColorsRef = useRef<Map<string, THREE.Color>>(new Map());

  useEffect(() => {
    if (!scene || originalColorsRef.current.size > 0) return;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = child.material.clone();
        originalColorsRef.current.set(child.uuid, child.material.color.clone());
      }
    });
  }, [scene]);

  useEffect(() => {
    const isNewStep = phaseIndex !== previousStateRef.current.phaseIndex || subStepIndex !== previousStateRef.current.subStepIndex;
    if (isNewStep) {
        animationProgressRef.current = 0;
    }
  }, [phaseIndex, subStepIndex]);

  useFrame((state, delta) => {
    const progress = animationProgressRef.current;
    if (progress >= 1) {
      previousStateRef.current = { phaseIndex, subStepIndex };
      return;
    }

    const newProgress = Math.min(progress + delta / ANIMATION_DURATION, 1);
    animationProgressRef.current = newProgress;

    const { phaseIndex: prevPhaseIndex, subStepIndex: prevSubStepIndex } = previousStateRef.current;

    const fromStepData = animationData[prevPhaseIndex]?.subSteps[prevSubStepIndex];
    const toStepData = animationData[phaseIndex]?.subSteps[subStepIndex];
    const fromPhaseData = animationData[prevPhaseIndex];
    const toPhaseData = animationData[phaseIndex];

    if (!fromStepData || !toStepData || !fromPhaseData || !toPhaseData) return;

    if (fromStepData.cameraState && toStepData.cameraState && orbitControls) {
      fromPos.fromArray(fromStepData.cameraState.position);
      toPos.fromArray(toStepData.cameraState.position);
      camera.position.lerpVectors(fromPos, toPos, newProgress);

      fromTarget.fromArray(fromStepData.cameraState.target);
      toTarget.fromArray(toStepData.cameraState.target);
      orbitControls.target.lerpVectors(fromTarget, toTarget, newProgress);
      orbitControls.update();
    }
    
    scene.traverse((child) => {
      const fromTransform = fromStepData.transforms[child.name];
      const toTransform = toStepData.transforms[child.name];
      if (fromTransform && toTransform) {
        fromPos.fromArray(fromTransform.position);
        toPos.fromArray(toTransform.position);
        child.position.lerpVectors(fromPos, toPos, newProgress);

        fromQuat.fromArray(fromTransform.quaternion);
        toQuat.fromArray(toTransform.quaternion);
        child.quaternion.slerpQuaternions(fromQuat, toQuat, newProgress);
        
        fromScale.fromArray(fromTransform.scale);
        toScale.fromArray(toTransform.scale);
        child.scale.lerpVectors(fromScale, toScale, newProgress);
      }

      if (child instanceof THREE.Mesh) {
        const defaultColor = originalColorsRef.current.get(child.uuid);
        if (defaultColor) {
            const fromColorHex = fromPhaseData.colorOverrides[child.name];
            const toColorHex = toPhaseData.colorOverrides[child.name];
            fromColor.set(fromColorHex || defaultColor);
            toColor.set(toColorHex || defaultColor);
            child.material.color.copy(fromColor).lerp(toColor, newProgress);
        }
      }
      
      const toVisibility = toStepData.visibility[child.name] ?? true;
      if (child.visible !== toVisibility && newProgress > 0.5) {
        child.visible = toVisibility;
      }
    });
  });

  return <primitive object={scene} />;
}