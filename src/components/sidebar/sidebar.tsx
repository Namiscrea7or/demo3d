"use client";

import { useState } from 'react';
import SceneTree from "./sceneTree";
import PropertiesPanel from "./propertiesPanel";
import EnvironmentPanel from "./EnvironmentPanel";
import * as THREE from 'three';
import type { Object3D, Vector3, Euler } from 'three';
import { LayoutGrid, Mountain } from 'lucide-react';
import clsx from 'clsx';

type SidebarProps = {
  scene: Object3D | null;
  visibility: Record<string, boolean>;
  toggleVisibility: (name: string) => void;
  resetVisibility: () => void;
  selectedObject: string | null;
  onSelectObject: (name: string | null) => void;
  selectedObjectNode: Object3D | null;
  onUpdateTransform: (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler, isFinal: boolean) => void;
  overrideColor: THREE.Color | null;
  onUpdateColor: (name: string, newColor: THREE.Color | null) => void;
  environmentProps: any;
};

export default function Sidebar(props: SidebarProps) {
  const [activeTab, setActiveTab] = useState('scene');

  const tabs = [
    { id: 'scene', label: 'Scene', icon: LayoutGrid },
    { id: 'environment', label: 'Environment', icon: Mountain },
  ];

  return (
    <div className="w-80 h-screen bg-gray-800 flex flex-col flex-shrink-0 border-r border-gray-700">
      <div className="p-2 border-b border-gray-700">
        <div className="grid grid-cols-2 gap-1">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex flex-col items-center justify-center p-2 rounded-md transition-colors',
                activeTab === tab.id ? 'bg-sky-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              )}
            >
              <tab.icon size={20} />
              <span className="text-xs mt-1 font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'scene' && (
          <div className="p-4 flex flex-col space-y-4">
            <SceneTree
              scene={props.scene}
              visibility={props.visibility}
              toggleVisibility={props.toggleVisibility}
              resetVisibility={props.resetVisibility}
              selectedObject={props.selectedObject}
              onSelectObject={props.onSelectObject}
            />
            <PropertiesPanel
              selectedObject={props.selectedObjectNode}
              overrideColor={props.overrideColor}
              onUpdateTransform={(name, prop, val, isFinal) => props.onUpdateTransform(name, prop, val, isFinal)}
              onUpdateColor={props.onUpdateColor}
            />
          </div>
        )}
        {activeTab === 'environment' && (
          <EnvironmentPanel environmentProps={props.environmentProps} />
        )}
      </div>
    </div>
  );
}