export interface Option {
  label: string;
  value: string;
}

export interface CustomizablePart {
  label: string;
  type: 'color';
  meshName: string;
  options: Option[];
  defaultValue: string;
}

export interface ModelConfiguration {
  [partKey: string]: CustomizablePart;
}

export interface ModelData {
  path: string;
  config: ModelConfiguration;
}

export interface AppConfiguration {
  [modelKey: string]: ModelData;
}