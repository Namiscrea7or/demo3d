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

const tempVec3 = new THREE.Vector3();
const tempQuat = new THREE.Quaternion();
const fromPos = new THREE.Vector3();
const toPos = new THREE.Vector3();
const fromQuat = new THREE.Quaternion();
const toQuat = new THREE.Quaternion();
const fromScale = new THREE.Vector3();
const toScale = new THREE.Vector3();
const fromColor = new THREE.Color();
const toColor = new THREE.Color();

const applyState = (
  scene: Object3D,
  phaseData: any,
  stepData: any,
  originalColors: Map<string, THREE.Color>
) => {
  if (!phaseData || !stepData) return;

  scene.traverse((child) => {
    const transform = stepData.transforms[child.name];
    if (transform) {
      child.position.fromArray(transform.position);
      child.quaternion.fromArray(transform.quaternion);
      child.scale.fromArray(transform.scale);
    }

    if (child instanceof THREE.Mesh) {
      const colorHex = phaseData.colorOverrides[child.name];
      const defaultColor = originalColors.get(child.uuid);
      if (colorHex) {
        child.material.color.set(colorHex);
      } else if (defaultColor) {
        child.material.color.copy(defaultColor);
      }
    }

    const visibility = stepData.visibility[child.name] ?? true;
    if (child.visible !== visibility) {
      child.visible = visibility;
    }
  });
};

export default function AnimatedModel({ scene, animationData, phaseIndex, subStepIndex }: Props) {
  const isAnimatingRef = useRef(false);
  const animationProgressRef = useRef(0);
  const fromStateRef = useRef<any>(null);
  const toStateRef = useRef<any>(null);
  const originalColorsRef = useRef<Map<string, THREE.Color>>(new Map());
  const hasInitializedRef = useRef(false);

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
    if (!animationData) return;

    const newPhaseData = animationData[phaseIndex];
    const newStepData = newPhaseData?.subSteps[subStepIndex];

    if (!newPhaseData || !newStepData) return;

    if (!hasInitializedRef.current || !toStateRef.current) {
      applyState(scene, newPhaseData, newStepData, originalColorsRef.current);
      toStateRef.current = { phase: newPhaseData, step: newStepData };
      hasInitializedRef.current = true;
    } else {
      fromStateRef.current = toStateRef.current;
      toStateRef.current = { phase: newPhaseData, step: newStepData };
      animationProgressRef.current = 0;
      isAnimatingRef.current = true;
    }
  }, [phaseIndex, subStepIndex, animationData, scene]);

  useFrame((state, delta) => {
    if (!isAnimatingRef.current || !fromStateRef.current || !toStateRef.current) return;
    
    if (animationProgressRef.current >= 1) {
      isAnimatingRef.current = false;
      applyState(scene, toStateRef.current.phase, toStateRef.current.step, originalColorsRef.current);
      return;
    }

    animationProgressRef.current += delta / ANIMATION_DURATION;
    const progress = Math.min(animationProgressRef.current, 1);

    const fromStepData = fromStateRef.current.step;
    const toStepData = toStateRef.current.step;
    const fromPhaseData = fromStateRef.current.phase;
    const toPhaseData = toStateRef.current.phase;

    scene.traverse((child) => {
      const fromTransform = fromStepData.transforms[child.name];
      const toTransform = toStepData.transforms[child.name];
      if (fromTransform && toTransform) {
        fromPos.fromArray(fromTransform.position);
        toPos.fromArray(toTransform.position);
        child.position.lerpVectors(fromPos, toPos, progress);

        fromQuat.fromArray(fromTransform.quaternion);
        toQuat.fromArray(toTransform.quaternion);
        child.quaternion.slerpQuaternions(fromQuat, toQuat, progress);
        
        fromScale.fromArray(fromTransform.scale);
        toScale.fromArray(toTransform.scale);
        child.scale.lerpVectors(fromScale, toScale, progress);
      }

      if (child instanceof THREE.Mesh) {
        const defaultColor = originalColorsRef.current.get(child.uuid);
        if (defaultColor) {
            const fromColorHex = fromPhaseData.colorOverrides[child.name];
            const toColorHex = toPhaseData.colorOverrides[child.name];
            fromColor.set(fromColorHex || defaultColor);
            toColor.set(toColorHex || defaultColor);
            child.material.color.copy(fromColor).lerp(toColor, progress);
        }
      }

      const toVisibility = toStepData.visibility[child.name] ?? true;
      if (child.visible !== toVisibility) {
        child.visible = toVisibility;
      }
    });
  });

  return <primitive object={scene} />;
}