"use client";

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Object3D } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const ANIMATION_DURATION = 1.0;

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
  const previousStateRef = useRef<{ phase: any; step: any } | null>(null);
  const originalColorsRef = useRef<Map<string, THREE.Color>>(new Map());
  const hasInitialized = useRef(false);

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
    if (!animationData || !orbitControls || hasInitialized.current) return;
    
    let initialCameraPos = camera.position.clone();
    let initialCameraTarget = orbitControls.target.clone();

    try {
        const storedStateJSON = sessionStorage.getItem('previewCameraState');
        if (storedStateJSON) {
            const storedState = JSON.parse(storedStateJSON);
            if (storedState.position) initialCameraPos.fromArray(storedState.position);
            if (storedState.target) initialCameraTarget.fromArray(storedState.target);
        }
    } catch (e) { console.error(e); }
    
    camera.position.copy(initialCameraPos);
    orbitControls.target.copy(initialCameraTarget);
    orbitControls.update();

    const initialPhase = animationData[phaseIndex];
    const initialStep = initialPhase?.subSteps[subStepIndex];
    
    previousStateRef.current = {
        phase: initialPhase,
        step: {
            ...initialStep,
            cameraState: {
                position: initialCameraPos.toArray(),
                target: initialCameraTarget.toArray()
            }
        }
    };
    
    hasInitialized.current = true;
    animationProgressRef.current = 0;

  }, [animationData, scene, camera, orbitControls]);

  useEffect(() => {
    if (!hasInitialized.current || !orbitControls) return;
    
    const isNewStep = phaseIndex !== previousStateRef.current?.phase?.id || 
                      subStepIndex !== previousStateRef.current?.step?.id;

    if (isNewStep) {
      if (previousStateRef.current?.step) {
        previousStateRef.current.step.cameraState = {
          position: camera.position.toArray(),
          target: orbitControls.target.toArray(),
        };
      }
      animationProgressRef.current = 0;
    }
  }, [phaseIndex, subStepIndex, camera, orbitControls]);

  useFrame((state, delta) => {
    if (animationProgressRef.current >= 1 || !previousStateRef.current) {
      return;
    }

    const progress = Math.min(animationProgressRef.current + delta / ANIMATION_DURATION, 1);
    
    const fromPhaseData = previousStateRef.current.phase;
    const fromStepData = previousStateRef.current.step;
    
    const toPhaseData = animationData[phaseIndex];
    const toStepData = toPhaseData?.subSteps[subStepIndex];

    if (!fromStepData || !toStepData || !fromPhaseData || !toPhaseData) return;

    if (fromStepData.cameraState && toStepData.cameraState && orbitControls) {
      fromPos.fromArray(fromStepData.cameraState.position);
      toPos.fromArray(toStepData.cameraState.position);
      camera.position.lerpVectors(fromPos, toPos, progress);

      fromTarget.fromArray(fromStepData.cameraState.target);
      toTarget.fromArray(toStepData.cameraState.target);
      orbitControls.target.lerpVectors(fromTarget, toTarget, progress);
      orbitControls.update();
    }
    
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
      const fromVisibility = fromStepData.visibility[child.name] ?? true;
      
      if (child.visible !== toVisibility) {
        child.visible = progress < 0.5 ? fromVisibility : toVisibility;
      }
    });

    if (progress >= 1) {
      previousStateRef.current = { phase: toPhaseData, step: toStepData };
    }
    animationProgressRef.current = progress;
  });

  return <primitive object={scene} />;
}