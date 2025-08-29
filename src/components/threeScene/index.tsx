"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";
import AnimatedModel from "../AnimatedModel"; // Import component mới

type Props = { step: number };

// Component nội dung sẽ tải dữ liệu và truyền xuống
function SceneContent({ step }: Props) {
  const { scene } = useGLTF("/ABB.glb"); // Tải model GLB của bạn
  const [animationData, setAnimationData] = useState(null);

  // Dùng useEffect để tải file JSON một lần
  useEffect(() => {
    fetch("/animation_data.json") // Đường dẫn tới file trong thư mục public
      .then((response) => response.json())
      .then((data) => {
        // Lưu mảng animationData vào state
        setAnimationData(data.animationData);
      })
      .catch((error) => console.error("Lỗi khi tải file animation:", error));
  }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

  // Chỉ render khi cả model và data đã được tải
  if (!animationData) {
    return null; // Hoặc hiển thị một loading indicator
  }

  return <AnimatedModel scene={scene} animationData={animationData} step={step} />;
}

export default function ThreeScene({ step }: Props) {
  return (
    <div className="w-full h-full bg-white">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <SceneContent step={step} />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}