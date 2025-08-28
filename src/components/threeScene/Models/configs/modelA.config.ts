import { ModelConfiguration } from './types';

export const modelAConfig: ModelConfiguration = {
  head: {
    label: 'Body',
    type: 'color',
    meshName: 'Imported1',
    options: [
      { label: '#001f3f (default)', value: '#001f3f' },
      { label: '#d11141', value: '#d11141' },
      { label: '#ffc425', value: '#ffc425' },
      { label: '#00a170', value: '#00a170' },
    ],
    defaultValue: '#001f3f',
  },
  body: {
    label: 'Head',
    type: 'color',
    meshName: 'Mesh018',
    options: [
      { label: '#808080', value: '#808080' },
      { label: '#000000', value: '#000000' },
      { label: '#ffffff', value: '#ffffff' },
    ],
    defaultValue: '#808080',
  },
};