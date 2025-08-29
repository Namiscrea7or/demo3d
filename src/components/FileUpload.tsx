"use client";

import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

type FileUploadProps = {
  onSceneLoaded: (scene: THREE.Object3D) => void;
};

export default function FileUpload({ onSceneLoaded }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target?.result;
      if (contents) {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loader.setDRACOLoader(dracoLoader);

        loader.parse(
          contents as ArrayBuffer,
          '',
          (gltf) => {
            onSceneLoaded(gltf.scene);
            setIsLoading(false);
          },
          (err) => {
            console.error("Error parsing GLTF", err);
            setError("Failed to parse the 3D model file.");
            setIsLoading(false);
          }
        );
      }
    };
    
    reader.onerror = () => {
        console.error("Error reading file");
        setError("Failed to read the file.");
        setIsLoading(false);
    }

    reader.readAsArrayBuffer(file);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }

  }, [onSceneLoaded]);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Upload a 3D Model</h1>
        <p className="text-gray-400 mb-6">Supported formats: .glb, .gltf</p>
        <button
          onClick={handleButtonClick}
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
        >
          {isLoading ? 'Loading...' : 'Select File'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".glb,.gltf"
          style={{ display: 'none' }}
        />
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}