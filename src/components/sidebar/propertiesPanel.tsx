"use client";

import { useState, useEffect } from 'react';
import * as THREE from 'three';
import type { Object3D, Vector3, Euler } from 'three';
import clsx from 'clsx';
import { SketchPicker, ColorResult } from 'react-color';

type PropertiesPanelProps = {
  selectedObject: Object3D | null;
  overrideColor: THREE.Color | null;
  onUpdateTransform: (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler) => void;
  onUpdateColor: (name: string, newColor: THREE.Color | null) => void;
};

const VectorInput = ({ label, value, onChange }: { label: string, value: { x: number, y: number, z: number }, onChange: (axis: 'x' | 'y' | 'z', val: number) => void }) => {
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <div className="grid grid-cols-3 gap-2 mt-1">
        {(['x', 'y', 'z'] as const).map(axis => (
          <div key={axis} className="flex items-center bg-gray-700 rounded">
            <span className="px-2 text-xs text-gray-400 select-none">{axis.toUpperCase()}</span>
            <input type="number" step={0.01} value={value[axis].toFixed(4)} onChange={(e) => onChange(axis, parseFloat(e.target.value) || 0)} className="w-full bg-transparent text-sm p-1 text-right focus:outline-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PropertiesPanel({ selectedObject, overrideColor, onUpdateTransform, onUpdateColor }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState('Transform');
  const [displayColor, setDisplayColor] = useState('#ffffff');
  
  const isOverrideActive = overrideColor !== null;

  useEffect(() => {
    if (overrideColor) {
      setDisplayColor(`#${overrideColor.getHexString()}`);
      return;
    }
    if (selectedObject) {
      let initialColor = '#ffffff';
      selectedObject.traverse(child => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = Array.isArray(child.material) ? child.material[0] : child.material;
          if (material && 'color' in material) {
            initialColor = `#${(material.color as THREE.Color).getHexString()}`;
          }
          return; 
        }
      });
      setDisplayColor(initialColor);
    }
  }, [selectedObject, overrideColor]);

  const handleTransformChange = (prop: 'position' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedObject) return;

    if (prop === 'rotation') {
      const newRotationEuler = selectedObject.rotation.clone();
      newRotationEuler[axis] = THREE.MathUtils.degToRad(value);
      onUpdateTransform(selectedObject.name, prop, newRotationEuler);
    } else {
      const newVec3 = selectedObject[prop].clone();
      newVec3[axis] = value;
      onUpdateTransform(selectedObject.name, prop, newVec3);
    }
  };

  const handleColorPickerChange = (color: ColorResult) => {
    if (!selectedObject) return;
    setDisplayColor(color.hex);
    onUpdateColor(selectedObject.name, new THREE.Color(color.hex));
  };
  
  const handleToggleOverride = () => {
    if (!selectedObject) return;
    if (isOverrideActive) {
      onUpdateColor(selectedObject.name, null);
    } else {
      onUpdateColor(selectedObject.name, new THREE.Color(displayColor));
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0">
      <h2 className="text-lg font-semibold mb-4">
        Properties: {selectedObject?.name ?? "None"}
      </h2>

      {!selectedObject ? (
        <div className="text-sm text-gray-500 bg-gray-700 p-4 rounded-md text-center">No Object Selected</div>
      ) : (
        <div className="bg-gray-700/50 p-2 rounded-md">
          <div className="grid grid-cols-2 gap-1 text-sm mb-2">
            <button onClick={() => setActiveTab('Transform')} className={clsx("p-1 rounded", { "bg-teal-600": activeTab === 'Transform' })}>Transform</button>
            <button onClick={() => setActiveTab('Material')} className={clsx("p-1 rounded", { "bg-teal-600": activeTab === 'Material' })}>Material</button>
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
            {activeTab === 'Material' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-200">Highlight Selection</label>
                  <button
                    onClick={handleToggleOverride}
                    className={clsx(
                      "px-4 py-1 text-xs rounded-full",
                      isOverrideActive ? "bg-teal-500 text-white" : "bg-gray-600 text-gray-300"
                    )}
                  >
                    {isOverrideActive ? 'ON' : 'OFF'}
                  </button>
                </div>
                
                {isOverrideActive && (
                  <div>
                    <div className="mt-2">
                      <SketchPicker
                        color={displayColor}
                        onChangeComplete={handleColorPickerChange}
                        width="100%"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}