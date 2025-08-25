// Trong file page.tsx của bạn

"use client";

import { useState } from "react";
import Sidebar from "../components/sidebar/sidebar";
import ThreeScene from "../components/threeScene/index";
import InstructionBar from "../components/instructions/instructsionBar";

export default function Page() {
  const [step, setStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isMuted={isMuted} setIsMuted={setIsMuted} />
      
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <ThreeScene step={step} />
        </div>

        <InstructionBar 
          step={step} 
          setStep={setStep} 
          isMuted={isMuted} 
        />
      </div>
    </div>
  );
}