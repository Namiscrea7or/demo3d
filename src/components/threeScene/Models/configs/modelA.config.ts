import { ModelConfiguration } from './types';

export const modelAConfig: ModelConfiguration = {
  head: {
    label: 'Màu Đầu',
    type: 'color',
    meshName: 'Imported1',
    options: [
      { label: 'Xanh Navy (Mặc định)', value: '#001f3f' },
      { label: 'Đỏ Ruby', value: '#d11141' },
      { label: 'Vàng Gold', value: '#ffc425' },
      { label: 'Xanh Lá Cây', value: '#00a170' },
    ],
    defaultValue: '#001f3f',
  },
  body: {
    label: 'Màu Thân',
    type: 'color',
    meshName: 'Imported2',
    options: [
      { label: 'Xám (Mặc định)', value: '#808080' },
      { label: 'Đen', value: '#000000' },
      { label: 'Trắng', value: '#ffffff' },
    ],
    defaultValue: '#808080',
  },
};