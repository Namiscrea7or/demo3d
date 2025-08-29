"use client";

import { useState } from 'react';

type TopBarProps = {
  onExport: () => void;
};

export default function TopBar({ onExport }: TopBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExportClick = () => {
    onExport();
    setIsMenuOpen(false);
  };

  return (
    <div className="absolute top-0 right-0 p-4 z-20">
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          onBlur={() => setTimeout(() => setIsMenuOpen(false), 100)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm rounded"
        >
          File
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg">
            <ul className="py-1">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleExportClick();
                  }}
                  className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                >
                  Export Animation (.json)
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}