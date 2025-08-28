import { AppConfiguration } from './types';
import { modelAConfig } from './modelA.config';
import { modelBConfig } from './modelB.config';

export const configurations: AppConfiguration = {
  modelA: {
    path: '/ABB.glb',
    config: modelAConfig,
  },
  modelB: {
    path: '/3d.glb',
    config: modelBConfig,
  },
};