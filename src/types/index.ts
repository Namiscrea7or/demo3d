import * as THREE from 'three';

export type TransformState = {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: THREE.Vector3;
};

export type SubStep = {
  id: string;
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
};