"use client";

import { useRef } from 'react';

type TopBarProps = {
  onExport: () => void;
  onPreview: () => void;
};

export default function TopBar({ onExport, onPreview }: TopBarProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex space-x-2">
      <button
        onClick={onPreview}
        className="bg-amber-100 hover:bg-amber-50 text-slate-600 font-bold py-2 px-4 rounded"
      >
        Preview
      </button>

      <button
        onClick={onExport}
        className="bg-cyan-400 hover:bg-cyan-300 text-white font-bold py-2 px-4 rounded"
      >
        Save
      </button>
    </div>
  );
}