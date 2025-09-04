"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { BookOpen, LogOut } from "lucide-react";
import type { Phase } from '@/types'; 
import InstructionPanel from "./InstructionPanel";

const ThreeScene = dynamic(() => import('./ThreeScene'), { ssr: false });

export default function PreviewPage() {
  const [animationData, setAnimationData] = useState<Phase[] | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  useEffect(() => {
    try {
      const jsonData = sessionStorage.getItem('previewAnimationData');
      if (jsonData) {
        const data = JSON.parse(jsonData);
        setAnimationData(data.animationData);
      } else {
        console.error("Không tìm thấy dữ liệu preview.");
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu preview:", error);
    }
  }, []);

  const handleExitPreview = () => {
    window.history.back();
  };

  const handleNextPhase = useCallback(() => {
    if (!animationData || phaseIndex >= animationData.length - 1) return;
    const newPhaseIndex = phaseIndex + 1;
    setPhaseIndex(newPhaseIndex);
    setSubStepIndex(0);
    setIsPlaying(false);
  }, [animationData, phaseIndex]);

  useEffect(() => {
    if (!isPlaying || !animationData) return;
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
    return <div className="w-screen h-screen flex items-center justify-center bg-gray-100">Loading Preview Data...</div>;
  }

  return (
    <main className="flex w-screen h-screen overflow-hidden">
      <div className="flex-1 relative min-w-0">
        <ThreeScene
          animationData={animationData}
          phaseIndex={phaseIndex}
          subStepIndex={subStepIndex}
        />
        <button 
            onClick={handleExitPreview}
            className="absolute top-5 left-5 p-3 bg-red-500 text-white bg-opacity-80 backdrop-blur-md rounded-full shadow-lg hover:bg-opacity-100 transition-all z-10"
        >
            <LogOut size={24} />
        </button>
      </div>
      
      {isPanelVisible ? (
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
      ) : (
        <button 
            onClick={() => setIsPanelVisible(true)}
            className="absolute top-5 right-5 p-3 bg-white bg-opacity-80 backdrop-blur-md rounded-full shadow-lg hover:bg-opacity-100 transition-all z-10"
        >
          <BookOpen size={24} className="text-gray-700" />
        </button>
      )}
    </main>
  );
}