"use client";

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Object3D, Mesh, Material } from 'three';

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

  // Dùng useRef để lưu trữ màu sắc gốc của từng bộ phận
  const originalColorsRef = useRef<Map<string, THREE.Color>>(new Map());

  // Effect này chạy một lần duy nhất để lưu lại màu sắc gốc
  useEffect(() => {
    if (!scene || originalColorsRef.current.size > 0) return; // Chỉ chạy 1 lần

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Sao chép material để tránh ảnh hưởng đến các object khác dùng chung material
        child.material = child.material.clone();
        // Lưu màu gốc vào map
        originalColorsRef.current.set(child.uuid, child.material.color.clone());
      }
    });
  }, [scene]);


  useEffect(() => {
    animationProgressRef.current = 0;
    return () => {
      previousStateRef.current = { phaseIndex, subStepIndex };
    };
  }, [subStepIndex, phaseIndex]);


  useFrame((state, delta) => {
    if (animationProgressRef.current >= 1) {
      // Logic đảm bảo trạng thái cuối cùng khi animation dừng
      const finalStepData = animationData[phaseIndex]?.subSteps[subStepIndex];
      const finalPhaseData = animationData[phaseIndex];
      if (!finalStepData || !finalPhaseData) return;

      scene.traverse((child) => {
        // Cập nhật transform cuối cùng
        const finalTransform = finalStepData.transforms[child.name];
        if (finalTransform) {
          child.position.set(finalTransform.position.x, finalTransform.position.y, finalTransform.position.z);
          child.quaternion.set(finalTransform.quaternion._x, finalTransform.quaternion._y, finalTransform.quaternion._z, finalTransform.quaternion._w);
          child.scale.set(finalTransform.scale.x, finalTransform.scale.y, finalTransform.scale.z);
        }
        // Cập nhật màu sắc cuối cùng
        if (child instanceof THREE.Mesh) {
            const finalColorHex = finalPhaseData.colorOverrides[child.name];
            const defaultColor = originalColorsRef.current.get(child.uuid);
            if (finalColorHex) {
                child.material.color.set(finalColorHex);
            } else if (defaultColor) {
                child.material.color.copy(defaultColor);
            }
        }
      });
      return;
    }

    animationProgressRef.current += delta / ANIMATION_DURATION;
    const progress = Math.min(animationProgressRef.current, 1);

    const { phaseIndex: prevPhaseIndex, subStepIndex: prevSubStepIndex } = previousStateRef.current;
    
    const fromStepData = animationData[prevPhaseIndex]?.subSteps[prevSubStepIndex];
    const toStepData = animationData[phaseIndex]?.subSteps[subStepIndex];
    const fromPhaseData = animationData[prevPhaseIndex];
    const toPhaseData = animationData[phaseIndex];

    if (!fromStepData || !toStepData || !fromPhaseData || !toPhaseData) return;

    scene.traverse((child) => {
      // -- Animation cho Transform --
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
      
      // -- Animation cho Màu sắc --
      if (child instanceof THREE.Mesh) {
        const defaultColor = originalColorsRef.current.get(child.uuid);
        if (defaultColor) {
            const fromColorHex = fromPhaseData.colorOverrides[child.name];
            const toColorHex = toPhaseData.colorOverrides[child.name];

            const fromColor = fromColorHex ? new THREE.Color(fromColorHex) : defaultColor;
            const toColor = toColorHex ? new THREE.Color(toColorHex) : defaultColor;

            // Nội suy màu và áp dụng
            child.material.color.copy(fromColor).lerp(toColor, progress);
        }
      }
      
      // -- Cập nhật Visibility --
      const toVisibility = toStepData.visibility[child.name] ?? true;
      if (child.visible !== toVisibility) {
        child.visible = toVisibility;
      }
    });
  });

  return <primitive object={scene} />;
}