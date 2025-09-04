"use client";

import { useState, useEffect, useCallback } from "react";
import ThreeScene from "../components/threeScene/index";
import InstructionPanel from "../components/instructions/instructsionBar";
import { BookOpen } from "lucide-react";

interface Transform {
  position: { x: number; y: number; z: number };
  quaternion: { _x: number; _y: number; _z: number; _w: number };
  scale: { x: number; y: number; z: number };
}

interface SubStep {
  id: string;
  description?: string;
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
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  useEffect(() => {
    fetch("/animation_data1.json")
      .then((res) => res.json())
      .then((data) => {
        setAnimationData(data.animationData);
      })
      .catch((err) => console.error("Can not download animation:", err));
  }, []);

  const handleNextPhase = useCallback(() => {
    if (!animationData || phaseIndex >= animationData.length - 1) return;
    const newPhaseIndex = phaseIndex + 1;
    setPhaseIndex(newPhaseIndex);
    setSubStepIndex(0);
    setIsPlaying(false);
  }, [animationData, phaseIndex]);

  useEffect(() => {
    if (!isPlaying || !animationData) {
      return;
    }

    const currentPhase = animationData[phaseIndex];
    if (!currentPhase) return;

    const interval = setInterval(() => {
      setSubStepIndex((prevIndex) => {
        const isLastStepInPhase = prevIndex >= currentPhase.subSteps.length - 1;
        if (isLastStepInPhase) {
          const isLastPhaseOverall = phaseIndex >= animationData.length - 1;
          if (isLastPhaseOverall) {
            setIsPlaying(false);
            return prevIndex;
          } else {
            handleNextPhase();
            return -1;
          }
        }
        return prevIndex + 1;
      });
    }, 1500); 

    return () => clearInterval(interval);
  }, [isPlaying, phaseIndex, animationData, handleNextPhase]);

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
      const isLastPhase = phaseIndex >= animationData.length - 1;
      if (isLastPhase) {
        setPhaseIndex(0);
        setSubStepIndex(0);
      } else {
        handleNextPhase();
      }
    }
    setIsPlaying((prev) => !prev);
  };

  if (!animationData) {
    return <div className="w-screen h-screen flex items-center justify-center bg-gray-100">Loading Animation...</div>;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <ThreeScene
        animationData={animationData}
        phaseIndex={phaseIndex}
        subStepIndex={subStepIndex}
      />
      
      {!isPanelVisible && (
         <button 
            onClick={() => setIsPanelVisible(true)}
            className="absolute top-5 right-5 p-3 bg-white bg-opacity-80 backdrop-blur-md rounded-full shadow-lg hover:bg-opacity-100 transition-all"
        >
           <BookOpen size={24} className="text-gray-700" />
        </button>
      )}

      {isPanelVisible && (
        <InstructionPanel
          animationData={animationData}
          currentPhaseIndex={phaseIndex}
          currentSubStepIndex={subStepIndex}
          isPlaying={isPlaying}
          onNextPhase={handleNextPhase}
          onPrevPhase={handlePrevPhase}
          onPlayToggle={handlePlayToggle}
          onClose={() => setIsPanelVisible(false)}
        />
      )}
    </main>
  );
}