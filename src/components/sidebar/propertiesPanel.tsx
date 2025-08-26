"use client";

import { useState } from 'react';
import * as THREE from 'three';
import type { Object3D, Vector3, Euler } from 'three';
import clsx from 'clsx';

type PropertiesPanelProps = {
  selectedObject: Object3D | null;
  onUpdate: (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler) => void;
};

const VectorInput = ({ label, value, onChange }: { label: string, value: { x: number, y: number, z: number }, onChange: (axis: 'x' | 'y' | 'z', val: number) => void }) => {
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <div className="grid grid-cols-3 gap-2 mt-1">
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="flex items-center bg-gray-700 rounded">
            <span className="px-2 text-xs text-gray-400 select-none">{axis.toUpperCase()}</span>
            <input type="number" step={0.01} value={value[axis].toFixed(4)} onChange={(e) => onChange(axis, parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-sm p-1 text-right focus:outline-none"/>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PropertiesPanel({ selectedObject, onUpdate }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('Transform');

  const handleTransformChange = (prop: 'position' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedObject) return;
    
    if (prop === 'rotation') {
      const newRotationEuler = selectedObject.rotation.clone();
      newRotationEuler[axis] = THREE.MathUtils.degToRad(value);
      onUpdate(selectedObject.name, prop, newRotationEuler);
    } else {
      const newVec3 = selectedObject[prop].clone();
      newVec3[axis] = value;
      onUpdate(selectedObject.name, prop, newVec3);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">Object Properties</h2>
      {!selectedObject ? (
        <div className="text-sm text-gray-500 bg-gray-700 p-4 rounded-md text-center">No Object Selected</div>
      ) : (
        <div className="bg-gray-700/50 p-2 rounded-md">
          <div className="grid grid-cols-2 gap-1 text-sm mb-2">
            <button onClick={() => setActiveTab('Transform')} className={clsx("p-1 rounded", { "bg-teal-600": activeTab === 'Transform' })}>Transform</button>
            <button onClick={() => setActiveTab('Highlight')} className={clsx("p-1 rounded", { "bg-teal-600": activeTab === 'Highlight' })}>Highlight</button>
          </div>
          <div className="space-y-3 p-1">
            {activeTab === 'Transform' && (
              <>
                <VectorInput label="Position" value={selectedObject.position} onChange={(axis, val) => handleTransformChange('position', axis, val)} />
                <VectorInput label="Rotation" value={{
                    x: THREE.MathUtils.radToDeg(selectedObject.rotation.x),
                    y: THREE.MathUtils.radToDeg(selectedObject.rotation.y),
                    z: THREE.MathUtils.radToDeg(selectedObject.rotation.z),
                }} onChange={(axis, val) => handleTransformChange('rotation', axis, val)} />
                <VectorInput label="Scale" value={selectedObject.scale} onChange={(axis, val) => handleTransformChange('scale', axis, val)} />
              </>
            )}
            {activeTab === 'Highlight' && <div className="text-center text-xs text-gray-500 p-4">Highlight options will be available here.</div>}
          </div>
        </div>
      )}
    </div>
  );
}