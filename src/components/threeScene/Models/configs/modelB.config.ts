import { ModelConfiguration } from './types';

export const modelBConfig: ModelConfiguration = {
  visor: {
    label: 'Table',
    type: 'color',
    meshName: 'Visor',
    options: [
      { label: '#f37735 (default)', value: '#f37735' },
      { label: '#00b159', value: '#00b159' },
      { label: '#8a2be2', value: '#8a2be2' },
    ],
    defaultValue: '#f37735',
  },
};