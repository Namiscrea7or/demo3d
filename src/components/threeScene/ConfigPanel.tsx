import React, { FC } from 'react';
import { ModelConfiguration } from './Models/configs/types';

interface ConfigPanelProps {
  config: ModelConfiguration;
  currentState: { [partKey: string]: string };
  onConfigChange: (partKey: string, value: string) => void;
}

const ConfigPanel: FC<ConfigPanelProps> = ({ config, currentState, onConfigChange }) => {
  const configKeys = Object.keys(config);

  if (configKeys.length === 0) {
    return (
      <div style={{ padding: '20px', borderLeft: '1px solid #ccc' }}>
        <p>No configs for this model.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3>Config</h3>
      {configKeys.map((key) => {
        const part = config[key];
        return (
          <div key={key}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              {part.label}
            </label>
            <select
              value={currentState[key] || part.defaultValue}
              onChange={(e) => onConfigChange(key, e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            >
              {part.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
};

export default ConfigPanel;