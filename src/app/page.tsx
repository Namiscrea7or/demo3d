"use client";

import { useState, useEffect } from "react";
import ThreeScene from "../components/threeScene/index";
import InstructionBar from "../components/instructions/instructsionBar";

interface Transform {
  position: { x: number; y: number; z: number };
  quaternion: { _x: number; _y: number; _z: number; _w: number };
  scale: { x: number; y: number; z: number };
}

interface SubStep {
  id: string;
  transforms: Record<string, Transform>;
  visibility: Record<string, boolean>;
}

interface Phase {
  id: string;
  name: string;
  subSteps: SubStep[];
  colorOverrides: Record<string, string>;
}

export default function Home() {
  const [animationData, setAnimationData] = useState<Phase[] | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetch("/animation_data.json")
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data.animationData);
      })
      .catch((err) => console.error("Không thể tải dữ liệu animation:", err));
  }, []);

  useEffect(() => {
    if (!isPlaying || !animationData) {
      return;
    }

    const currentPhase = animationData[phaseIndex];
    if (!currentPhase) return;

    const interval = setInterval(() => {
      setSubStepIndex((prevIndex) => {
        if (prevIndex >= currentPhase.subSteps.length - 1) {
          setIsPlaying(false);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, 1500); 

    return () => clearInterval(interval);
  }, [isPlaying, phaseIndex, animationData]);


  const handleNextPhase = () => {
    if (!animationData || phaseIndex >= animationData.length - 1) return;
    const newPhaseIndex = phaseIndex + 1;
    setPhaseIndex(newPhaseIndex);
    setSubStepIndex(0);
    setIsPlaying(false);
  };

  const handlePrevPhase = () => {
    if (phaseIndex <= 0) return;
    const newPhaseIndex = phaseIndex - 1;
    setPhaseIndex(newPhaseIndex);
    setSubStepIndex(0);
    setIsPlaying(false);
  };

  const handlePlayToggle = () => {
    if (!animationData) return;
    const currentPhase = animationData[phaseIndex];
    if (subStepIndex >= currentPhase.subSteps.length - 1) {
      setSubStepIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  if (!animationData) {
    return <div>Loading Animation...</div>;
  }

  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <ThreeScene
        animationData={animationData}
        phaseIndex={phaseIndex}
        subStepIndex={subStepIndex}
      />
      <InstructionBar
        animationData={animationData}
        phaseIndex={phaseIndex}
        subStepIndex={subStepIndex}
        isPlaying={isPlaying}
        onNextPhase={handleNextPhase}
        onPrevPhase={handlePrevPhase}
        onPlayToggle={handlePlayToggle}
      />
    </main>
  );
}