import type { Vector3, Quaternion } from 'three';

export type LightState = {
  color: string;
  intensity: number;
};

export type DirectionalLightState = LightState & {
  position: [number, number, number];
};

export type EnvironmentState = {
  ambientLight: LightState;
  directionalLight: DirectionalLightState;
};

export type CameraState = {
  position: Vector3;
  target: Vector3;
};

export type TransformState = {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

export type SubStep = {
  id: string;
  thumbnail?: string;
  cameraState?: CameraState;
  transforms: Record<string, TransformState>;
  visibility: Record<string, boolean>;
  transformHistory: {
    past: Record<string, TransformState>[];
    future: Record<string, TransformState>[];
  };
};

export type Phase = {
  id: string;
  name: string;
  subSteps: SubStep[];
  colorOverrides: Record<string, string>;
};

export type AnimationProject = {
  environment: EnvironmentState;
  animationData: Phase[];
};