import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { loadModel, disposeModel } from './Models/ModelLoader';
import { ModelConfiguration } from './Models/configs/types';

export interface ThreeSceneAPI {
  updateMeshColor: (meshName: string, color: string) => void;
}

interface ThreeScenePureJSProps {
  modelPath: string;
  config: ModelConfiguration;
}

const ThreeScenePureJS = forwardRef<ThreeSceneAPI, ThreeScenePureJSProps>(({ modelPath, config }, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const customizableMeshesRef = useRef<{ [meshName: string]: THREE.Mesh }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    updateMeshColor(meshName, color) {
      const mesh = customizableMeshesRef.current[meshName];
      if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.set(color);
      }
    },
  }));

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount || !modelPath) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 8);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setClearColor(0xffffff, 1);
    currentMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    setIsLoading(true);
    customizableMeshesRef.current = {};
    
    loadModel(modelPath,
      (gltf: GLTF) => {
        const model = gltf.scene;
        scene.add(model);

        const configParts = Object.values(config);
        const meshNamesToFind = configParts.map(part => part.meshName);

        model.traverse((object) => {
          if (object instanceof THREE.Mesh && meshNamesToFind.includes(object.name)) {
            customizableMeshesRef.current[object.name] = object;
          }
        });

        configParts.forEach(part => {
          const mesh = customizableMeshesRef.current[part.meshName];
          if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.color.set(part.defaultValue);
          }
        });

        setIsLoading(false);
      },
      (error) => {
        console.error(`Error loading model at ${modelPath}:`, error);
        setIsLoading(false);
      }
    );

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => { /* Logic resize */ };
    window.addEventListener('resize', handleResize);

    return () => { /* Logic dọn dẹp */ };
  }, [modelPath, config]);

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading && <div>Loading...</div>}
    </div>
  );
});

export default ThreeScenePureJS;