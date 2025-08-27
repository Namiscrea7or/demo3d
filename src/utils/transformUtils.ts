import * as THREE from 'three';
import type { Object3D } from 'three';
import type { TransformState } from '@/types';
export const extractTransforms = (scene: Object3D): Record<string, TransformState> => {
    const transforms: Record<string, TransformState> = {};
    scene.traverse(obj => {
        if (obj.name) {
            transforms[obj.name] = {
                position: obj.position.clone(),
                quaternion: obj.quaternion.clone(),
                scale: obj.scale.clone(),
            };
        }
    });
    return transforms;
};
export const applyTransforms = (scene: Object3D, transforms: Record<string, TransformState>): void => {
    scene.traverse(obj => {
        if (obj.name && transforms[obj.name]) {
            const t = transforms[obj.name];
            obj.position.copy(t.position);
            obj.quaternion.copy(t.quaternion);
            obj.scale.copy(t.scale);
            obj.updateMatrix();
        }
    });
};