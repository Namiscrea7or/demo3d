import { ModelConfiguration } from './types';

export const modelBConfig: ModelConfiguration = {
  visor: {
    label: 'Màu Kính',
    type: 'color',
    meshName: 'Visor',
    options: [
      { label: 'Vàng Cam (Mặc định)', value: '#f37735' },
      { label: 'Xanh Cyan', value: '#00b159' },
      { label: 'Tím', value: '#8a2be2' },
    ],
    defaultValue: '#f37735',
  },
};