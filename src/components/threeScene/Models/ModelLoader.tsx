import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const loadModel = (
  modelPath: string,
  onLoad: (gltf: GLTF) => void,
  onError: (error: unknown) => void
): void => {
  const loader = new GLTFLoader();
  loader.load(modelPath, onLoad, undefined, onError);
};

export const disposeModel = (model: THREE.Object3D | undefined): void => {
  if (!model) return;
  model.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach((material: THREE.Material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
};