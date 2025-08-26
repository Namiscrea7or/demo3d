"use client";

import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import * as THREE from 'three';
import type { Object3D } from 'three';

type SidebarProps = {
  scene: Object3D | null;
  visibility: Record<string, boolean>;
  toggleVisibility: (name: string) => void;
  resetVisibility: () => void;
};

const isGroupVisible = (object: Object3D, visibility: Record<string, boolean>): boolean => {
  if (object instanceof THREE.Mesh) return visibility[object.name] ?? true;
  for (const child of object.children) {
    if (isGroupVisible(child, visibility)) return true;
  }
  return false;
};

const SceneNode = ({ object, visibility, toggleVisibility, userExpanded, autoExpandSet, toggleExpansion, level = 0 }: {
  object: Object3D,
  visibility: Record<string, boolean>,
  toggleVisibility: (name: string) => void,
  userExpanded: Record<string, boolean>,
  autoExpandSet: Set<string>,
  toggleExpansion: (uuid: string) => void,
  level?: number
}) => {
  const hasChildren = object.children && object.children.length > 0;
  const isVisible = isGroupVisible(object, visibility);
  const isExpanded = userExpanded[object.uuid] ?? autoExpandSet.has(object.uuid);

  return (
    <div style={{ paddingLeft: `${level * 16}px` }}>
      <div className="flex items-center justify-between p-1.5 hover:bg-gray-700 rounded-md group">
        <div className="flex items-center flex-1 truncate" onClick={() => hasChildren && toggleExpansion(object.uuid)}>
          {hasChildren ? (
            <span className="mr-1 text-gray-400">
              {isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
            </span>
          ) : (
            <div className="w-5 mr-1"></div>
          )}
          <span className="text-sm cursor-pointer">{object.name || 'Unnamed Object'}</span>
        </div>
        <button onClick={() => toggleVisibility(object.name)} className="text-gray-400 hover:text-white ml-2">
          {isVisible ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
        </button>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {object.children.map(child => (
            <SceneNode
              key={child.uuid}
              object={child}
              visibility={visibility}
              toggleVisibility={toggleVisibility}
              userExpanded={userExpanded}
              autoExpandSet={autoExpandSet}
              toggleExpansion={toggleExpansion}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const filterScene = (scene: Object3D | null, searchTerm: string): { filteredTree: Object3D[], autoExpandSet: Set<string> } => {
  if (!scene) return { filteredTree: [], autoExpandSet: new Set() };
  if (!searchTerm) return { filteredTree: scene.children, autoExpandSet: new Set() };

  const lowerCaseSearch = searchTerm.toLowerCase();
  const autoExpandSet = new Set<string>();

  function recursiveFilter(nodes: Object3D[]): Object3D[] {
    return nodes.reduce<Object3D[]>((acc, node) => {
      const children = recursiveFilter(node.children);
      const nameMatches = node.name.toLowerCase().includes(lowerCaseSearch);

      if (nameMatches || children.length > 0) {
        const clonedNode = node.clone(false);
        clonedNode.children = children;
        if (children.length > 0 && nameMatches === false) {
          autoExpandSet.add(clonedNode.uuid);
        }
        acc.push(clonedNode);
      }
      return acc;
    }, []);
  }

  return { filteredTree: recursiveFilter(scene.children), autoExpandSet };
};

export default function Sidebar({ scene, visibility, toggleVisibility, resetVisibility }: SidebarProps) {
  const [userExpanded, setUserExpanded] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [{ filteredTree, autoExpandSet }, setFilteredData] = useState<{ filteredTree: Object3D[], autoExpandSet: Set<string> }>({ filteredTree: [], autoExpandSet: new Set() });

  useEffect(() => {
    setFilteredData(filterScene(scene, searchTerm));
  }, [scene, searchTerm]);

  const toggleExpansion = (uuid: string) => {
    setUserExpanded(prev => ({ ...prev, [uuid]: !prev[uuid] }));
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Scene Tree</h2>
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm text-white"
        />
        <button onClick={resetVisibility} className="p-1.5 border border-gray-600 bg-gray-700 rounded-md hover:bg-gray-600" title="Reset Visibility">
          <EyeIcon className="h-5 w-5 text-gray-300" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        {scene ? filteredTree.map(child => (
          <SceneNode
            key={child.uuid}
            object={child}
            visibility={visibility}
            toggleVisibility={toggleVisibility}
            userExpanded={userExpanded}
            autoExpandSet={autoExpandSet}
            toggleExpansion={toggleExpansion}
          />
        )) : <p className="text-sm text-gray-500">Loading model...</p>}
      </div>
    </div>
  );
}