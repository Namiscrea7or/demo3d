"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react';
import ThreeScenePureJS, { ThreeSceneAPI } from '../components/threeScene/index';
import ConfigPanel from '../components/threeScene/ConfigPanel';
import { configurations } from '../components/threeScene/Models/configs/index';

const App: React.FC = () => {
  const [currentModelName, setCurrentModelName] = useState<string>('modelA');
  const [configState, setConfigState] = useState<{ [partKey: string]: string }>({});
  
  const threeSceneApiRef = useRef<ThreeSceneAPI>(null);

  const currentModelData = useMemo(() => configurations[currentModelName] || { path: '', config: {} }, [currentModelName]);

  useEffect(() => {
    const newDefaultState: { [partKey: string]: string } = {};
    for (const key in currentModelData.config) {
      newDefaultState[key] = currentModelData.config[key].defaultValue;
    }
    setConfigState(newDefaultState);
  }, [currentModelData]);

  const handleConfigChange = (partKey: string, value: string) => {
    setConfigState(prevState => ({
      ...prevState,
      [partKey]: value,
    }));

    const partConfig = currentModelData.config[partKey];
    if (partConfig) {
      threeSceneApiRef.current?.updateMeshColor(partConfig.meshName, value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>
        <h1>3D Model Customizer</h1>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => setCurrentModelName('modelA')}>Model A</button>
          <button onClick={() => setCurrentModelName('modelB')}>Model B</button>
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', flex: 1 }}>
        <div style={{ position: 'relative', background: '#f0f0f0' }}>
          {currentModelData.path && (
            <ThreeScenePureJS
              ref={threeSceneApiRef}
              modelPath={currentModelData.path}
              config={currentModelData.config}
            />
          )}
        </div>
        <aside>
          <ConfigPanel
            config={currentModelData.config}
            currentState={configState}
            onConfigChange={handleConfigChange}
          />
        </aside>
      </main>
    </div>
  );
};

export default App;