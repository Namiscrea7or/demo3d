"use client";

import * as THREE from 'three';
import clsx from 'clsx';

const lightPresets = [
    { name: 'Default', ambient: { color: '#ffffff', intensity: 0.3 }, directional: { color: '#ffffff', intensity: 1.5, position: [5, 5, 5] } },
    { name: 'Soft', ambient: { color: '#ffffff', intensity: 0.7 }, directional: { color: '#ffffff', intensity: 0.5, position: [0, 10, 0] } },
    { name: 'Harsh', ambient: { color: '#ffffff', intensity: 0.1 }, directional: { color: '#ffffff', intensity: 2.5, position: [10, 2, 0] } },
    { name: 'Warm', ambient: { color: '#ffd0a1', intensity: 0.2 }, directional: { color: '#ffe4b5', intensity: 1.2, position: [-5, 5, 5] } },
    { name: 'Cool', ambient: { color: '#a1c4ff', intensity: 0.2 }, directional: { color: '#cde4ff', intensity: 1.2, position: [5, 5, -5] } },
    { name: 'Night', ambient: { color: '#40526b', intensity: 0.5 }, directional: { color: '#4c6aa3', intensity: 0.8, position: [0, 5, -10] } },
];


const NumberInput = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
    <input 
        type="number"
        aria-label={label}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-center"
    />
);

export default function EnvironmentPanel({ environmentProps }: { environmentProps: any }) {
  const {
    ambientLight, setAmbientLight,
    directionalLight, setDirectionalLight,
  } = environmentProps;

  const applyPreset = (preset: typeof lightPresets[0]) => {
      setAmbientLight(preset.ambient);
      setDirectionalLight(preset.directional);
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Light Presets</h3>
        <div className="grid grid-cols-2 gap-2">
          {lightPresets.map(p => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={clsx(
                'p-2 rounded-md text-sm font-semibold transition-colors',
                'bg-gray-700 hover:bg-gray-600 border border-gray-600'
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Ambient Light</h3>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 items-center">
                <span className="text-xs text-gray-300">Color</span>
                <input type="color" value={ambientLight.color} onChange={e => setAmbientLight(p => ({...p, color: e.target.value}))} className="w-full h-8 p-1 bg-gray-700 border border-gray-600 rounded" />
            </div>
            <label className="block space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-300">
                    <span>Intensity</span>
                    <span>{ambientLight.intensity.toFixed(2)}</span>
                </div>
                <input type="range" min={0} max={5} step={0.01} value={ambientLight.intensity} onChange={e => setAmbientLight(p => ({...p, intensity: parseFloat(e.target.value)}))} className="w-full" />
            </label>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Directional Light</h3>
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 items-center">
                <span className="text-xs text-gray-300">Color</span>
                <input type="color" value={directionalLight.color} onChange={e => setDirectionalLight(p => ({...p, color: e.target.value}))} className="w-full h-8 p-1 bg-gray-700 border border-gray-600 rounded" />
            </div>
            <label className="block space-y-2">
                <div className="flex justify-between items-center text-xs text-gray-300">
                    <span>Intensity</span>
                    <span>{directionalLight.intensity.toFixed(2)}</span>
                </div>
                <input type="range" min={0} max={5} step={0.01} value={directionalLight.intensity} onChange={e => setDirectionalLight(p => ({...p, intensity: parseFloat(e.target.value)}))} className="w-full" />
            </label>
            <div>
                <span className="text-xs text-gray-300 mb-1 block">Position</span>
                <div className="grid grid-cols-3 gap-2">
                    <NumberInput label="X" value={directionalLight.position[0]} onChange={v => setDirectionalLight(p => ({...p, position: [v, p.position[1], p.position[2]]}))} />
                    <NumberInput label="Y" value={directionalLight.position[1]} onChange={v => setDirectionalLight(p => ({...p, position: [p.position[0], v, p.position[2]]}))} />
                    <NumberInput label="Z" value={directionalLight.position[2]} onChange={v => setDirectionalLight(p => ({...p, position: [p.position[0], p.position[1], v]}))} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}