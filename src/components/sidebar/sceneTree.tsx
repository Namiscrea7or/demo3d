"use client";

import { useState, useMemo, useRef } from "react";
import { EyeIcon, EyeSlashIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import * as THREE from 'three';
import type { Object3D } from 'three';
import clsx from 'clsx';

type SceneTreeProps = {
    scene: Object3D | null;
    visibility: Record<string, boolean>;
    toggleVisibility: (name: string) => void;
    resetVisibility: () => void;
    selectedObject: string | null;
    onSelectObject: (name: string) => void;
};

type SceneNodeProps = {
    object: Object3D;
    visibility: Record<string, boolean>;
    toggleVisibility: (name: string) => void;
    userExpanded: Record<string, boolean>;
    autoExpandSet: Set<string>;
    toggleExpansion: (uuid: string) => void;
    selectedObject: string | null;
    onSelectObject: (name: string) => void;
    nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
    level?: number;
};

const isGroupVisible = (object: Object3D, visibility: Record<string, boolean>): boolean => {
    if (object instanceof THREE.Mesh) return visibility[object.name] ?? true;
    for (const child of object.children) {
        if (isGroupVisible(child, visibility)) return true;
    }
    return false;
};

const SceneNode = (props: SceneNodeProps) => {
    const { object, visibility, toggleVisibility, userExpanded, autoExpandSet, toggleExpansion, selectedObject, onSelectObject, nodeRefs, level = 0 } = props;
    const hasChildren = object.children && object.children.length > 0;
    const isVisible = isGroupVisible(object, visibility);
    const isExpanded = userExpanded[object.uuid] ?? false;
    const isSelected = selectedObject === object.name;

    return (
        <div>
            <div ref={(el) => { nodeRefs.current.set(object.name, el); }} className={clsx("flex items-center justify-between p-1.5 hover:bg-gray-700 rounded-md group", { "bg-teal-600": isSelected })}>
                <div className="flex items-center flex-1 truncate" onClick={() => hasChildren ? toggleExpansion(object.uuid) : onSelectObject(object.name)}>
                    {hasChildren ? <span className="mr-1 text-gray-400">{isExpanded ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}</span> : <div className="w-5 mr-1"></div>}
                    <span className="text-sm cursor-pointer" onClick={(e) => { e.stopPropagation(); onSelectObject(object.name); }}>{object.name || 'Unnamed Object'}</span>
                </div>
                <button onClick={() => toggleVisibility(object.name)} className="text-gray-400 hover:text-white ml-2">{isVisible ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}</button>
            </div>
            {isExpanded && hasChildren && <div className="mt-1">{object.children.map(child => <SceneNode key={child.uuid} {...props} object={child} level={level + 1} />)}</div>}
        </div>
    );
};

const filterScene = (
    scene: Object3D | null,
    searchTerm: string,
    showHiddenOnly: boolean,
    visibility: Record<string, boolean>
): { filteredTree: Object3D[]; autoExpandSet: Set<string> } => {
    if (!scene) return { filteredTree: [], autoExpandSet: new Set() };

    const autoExpandSet = new Set<string>();
    const lowerCaseSearch = searchTerm.toLowerCase();

    if (showHiddenOnly) {
        const hiddenMeshes: Object3D[] = [];

        scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh && visibility[obj.name] === false) {
                if (!searchTerm || obj.name.toLowerCase().includes(lowerCaseSearch)) {
                    const cloned = obj.clone(true);
                    cloned.uuid = obj.uuid;
                    hiddenMeshes.push(cloned);
                }
            }
        });

        return { filteredTree: hiddenMeshes, autoExpandSet: new Set() };
    }

    function filterNode(node: Object3D): Object3D | null {
        const filteredChildren = node.children.map(filterNode).filter(Boolean) as Object3D[];
        const searchMatch = node.name.toLowerCase().includes(lowerCaseSearch);

        if (searchMatch || filteredChildren.length > 0) {
            const clonedNode = node.clone(false);
            clonedNode.uuid = node.uuid;
            clonedNode.children = filteredChildren;
            if (filteredChildren.length > 0) {
                autoExpandSet.add(clonedNode.uuid);
            }
            return clonedNode;
        }
        return null;
    }

    const filteredTree = scene.children.map(filterNode).filter(Boolean) as Object3D[];
    return { filteredTree, autoExpandSet };
};


export default function SceneTree({ scene, visibility, toggleVisibility, resetVisibility, selectedObject, onSelectObject }: SceneTreeProps) {
    const [userExpanded, setUserExpanded] = useState<Record<string, boolean>>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showHiddenOnly, setShowHiddenOnly] = useState(false);
    const nodeRefs = useRef(new Map<string, HTMLDivElement | null>());
    const { filteredTree, autoExpandSet } = useMemo(() => filterScene(scene, searchTerm, showHiddenOnly, visibility), [scene, searchTerm, showHiddenOnly, visibility]);

    const toggleExpansion = (uuid: string) => setUserExpanded(prev => ({ ...prev, [uuid]: !prev[uuid] }));
    const handleFocusSelection = () => { if (selectedObject) nodeRefs.current.get(selectedObject)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

    return (
        <div className="flex flex-col min-h-0">
            <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Scene Tree</h2>
            <div className="mb-3 flex-shrink-0"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm text-white" /></div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm flex-shrink-0">
                <button onClick={handleFocusSelection} disabled={!selectedObject} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">Focus Selection</button>
                <button onClick={() => setShowHiddenOnly(!showHiddenOnly)} className={clsx("px-2 py-1 rounded", showHiddenOnly ? "bg-teal-600" : "bg-gray-700 hover:bg-gray-600")}>Show Hidden Only</button>
                <button onClick={resetVisibility} className="col-span-2 flex items-center justify-center space-x-2 px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"><EyeIcon className="h-5 w-5" /> <span>Reset Visibility</span></button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 space-y-1">
                {scene ? filteredTree.map(child => (
                    <SceneNode
                        key={child.uuid}
                        object={child}
                        visibility={visibility}
                        toggleVisibility={toggleVisibility}
                        userExpanded={userExpanded}
                        autoExpandSet={autoExpandSet}
                        toggleExpansion={toggleExpansion}
                        selectedObject={selectedObject}
                        onSelectObject={onSelectObject}
                        nodeRefs={nodeRefs}
                    />
                )) : <p className="text-sm text-gray-500">Loading model...</p>}
            </div>
        </div>
    );
}