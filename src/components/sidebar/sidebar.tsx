"use client";

import SceneTree from "./sceneTree";
import PropertiesPanel from "./propertiesPanel";
import * as THREE from 'three';
import type { Object3D, Vector3, Euler } from 'three';

type SidebarProps = {
  scene: Object3D | null;
  visibility: Record<string, boolean>;
  toggleVisibility: (name: string) => void;
  resetVisibility: () => void;
  selectedObject: string | null;
  onSelectObject: (name: string) => void;
  selectedObjectNode: Object3D | null;
  onUpdateTransform: (name: string, prop: 'position' | 'rotation' | 'scale', value: Vector3 | Euler, isFinal: boolean) => void;
};

export default function Sidebar(props: SidebarProps) {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col space-y-4">
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
        onUpdate={(name, prop, val) => props.onUpdateTransform(name, prop, val, true)}
      />
    </div>
  );
}