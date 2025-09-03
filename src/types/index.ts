import type { Vector3, Quaternion } from 'three';

export type TransformState = {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

export type SubStep = {
  id: string;
  thumbnail?: string;
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