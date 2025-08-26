"use client";

import { ArrowUturnLeftIcon, ArrowUturnRightIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import clsx from 'clsx';

type ViewportToolbarProps = {
  transformMode: 'select' | 'translate' | 'rotate' | 'scale';
  onSetTransformMode: (mode: 'select' | 'translate' | 'rotate' | 'scale') => void;
  onHideSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const ToolButton = ({ children, active, ...props }: any) => (
  <button {...props} className={clsx("p-2 rounded-md", active ? "bg-teal-500 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-300")}>
    {children}
  </button>
);

const MoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);
const RotateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 8.5A6 6 0 0 1 8.5 2.5v0A6 6 0 0 1 15.5 8.5v0A6 6 0 0 1 8.5 15.5v0A6 6 0 0 1 2.5 8.5v0z"/><path d="M15.5 8.5a6 6 0 0 1 6 6v0a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6v0a6 6 0 0 1 6-6v0z"/></svg>
);
const ScaleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3l-6.6 6.6-3.8-3.8 6.6-6.6-3.8-3.8 6.6-6.6-3.8-3.8 6.6 6.6-3.8 3.8 6.6 6.6-3.8 3.8zM3.8 3.8l6.6 6.6-3.8 3.8L13 20.9l-6.6-6.6 3.8-3.8L3.8 3.8z"/></svg>
);


export default function ViewportToolbar({ transformMode, onSetTransformMode, onHideSelected, onUndo, onRedo, canUndo, canRedo }: ViewportToolbarProps) {
  return (
    <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col space-y-3">
      <div className="bg-gray-800/80 p-1.5 rounded-lg flex flex-col space-y-1">
        <ToolButton active={transformMode === 'translate'} onClick={() => onSetTransformMode('translate')} title="Move (W)">
          <MoveIcon/>
        </ToolButton>
        <ToolButton active={transformMode === 'rotate'} onClick={() => onSetTransformMode('rotate')} title="Rotate (E)">
          <RotateIcon/>
        </ToolButton>
        <ToolButton active={transformMode === 'scale'} onClick={() => onSetTransformMode('scale')} title="Scale (R)">
          <ScaleIcon/>
        </ToolButton>
      </div>
      <div className="bg-gray-800/80 p-1.5 rounded-lg flex flex-col space-y-1">
        <ToolButton onClick={onHideSelected} title="Hide Selected">
          <EyeSlashIcon className="h-5 w-5" />
        </ToolButton>
      </div>
      <div className="bg-gray-800/80 p-1.5 rounded-lg flex flex-col space-y-1">
        <ToolButton onClick={onUndo} disabled={!canUndo} className={clsx("p-2 rounded-md", "bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed")}>
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </ToolButton>
        <ToolButton onClick={onRedo} disabled={!canRedo} className={clsx("p-2 rounded-md", "bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed")}>
           <ArrowUturnRightIcon className="h-5 w-5" />
        </ToolButton>
      </div>
    </div>
  );
}