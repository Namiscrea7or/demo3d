"use client";

import { Undo, Redo, Move, Rotate3d, Scale, EyeOff } from 'lucide-react';

type TransformMode = 'select' | 'translate' | 'rotate' | 'scale';

type ViewportToolbarProps = {
  transformMode: TransformMode;
  onSetTransformMode: (mode: TransformMode) => void;
  onHideSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const IconButton = ({ children, onClick, isActive = false, disabled = false }: { children: React.ReactNode, onClick: () => void, isActive?: boolean, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded ${isActive ? 'bg-teal-600' : 'bg-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
  >
    {children}
  </button>
);

export default function ViewportToolbar({
  transformMode,
  onSetTransformMode,
  onHideSelected,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: ViewportToolbarProps) {
  return (
    <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col space-y-2">
      <div className="bg-gray-800 p-1.5 rounded-lg shadow-lg flex flex-col space-y-1.5">
        <IconButton onClick={() => onSetTransformMode('translate')} isActive={transformMode === 'translate'}>
          <Move size={20} />
        </IconButton>
        <IconButton onClick={() => onSetTransformMode('rotate')} isActive={transformMode === 'rotate'}>
          <Rotate3d size={20} />
        </IconButton>
        <IconButton onClick={() => onSetTransformMode('scale')} isActive={transformMode === 'scale'}>
          <Scale size={20} />
        </IconButton>
      </div>
      
      <div className="bg-gray-800 p-1.5 rounded-lg shadow-lg flex flex-col space-y-1.5">
         <IconButton onClick={onHideSelected}>
          <EyeOff size={20} />
        </IconButton>
      </div>

      <div className="bg-gray-800 p-1.5 rounded-lg shadow-lg flex flex-col space-y-1.5">
        <IconButton onClick={onUndo} disabled={!canUndo}>
          <Undo size={20} />
        </IconButton>
        <IconButton onClick={onRedo} disabled={!canRedo}>
          <Redo size={20} />
        </IconButton>
      </div>
    </div>
  );
}