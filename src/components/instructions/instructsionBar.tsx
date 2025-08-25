"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function InstructionBar({
  step,
  setStep,
  isMuted,
}: {
  step: number;
  setStep: (s: number) => void;
  isMuted: boolean;
}) {
  const { t, i18n } = useTranslation();
  const [instructions, setInstructions] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (isMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isMuted]);

  useEffect(() => {
    const translatedSteps = t('steps', { returnObjects: true }) as string[];
    if (Array.isArray(translatedSteps)) {
      setInstructions(translatedSteps);
      setStep(0);
    }
  }, [i18n.language, t, setStep]);

  const speak = (text: string) => {
    if (isMuted || !("speechSynthesis" in window) || !text || availableVoices.length === 0) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const desiredVoiceName = t('voiceName'); 

    const selectedVoice = availableVoices.find(voice => voice.name === desiredVoiceName);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    } else {
      console.warn(`Voice "${desiredVoiceName}" not found. Using browser default.`);
      utterance.lang = i18n.language === "fr" ? "fr-FR" : "en-US";
    }

    utterance.onend = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleNext = () => {
    if (step < instructions.length - 1) {
      const next = step + 1;
      setStep(next);
      speak(instructions[next]);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      speak(instructions[prev]);
    }
  };

  const toggleSpeech = () => {
    if (!utteranceRef.current || !instructions[step]) {
      speak(instructions[step]);
      return;
    }
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    } else {
      speak(instructions[step]);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-100 border-t border-gray-300 p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-400 text-gray-700 font-medium">
          {step + 1}
        </div>
        <div className="text-gray-800 text-base font-medium max-w-3xl">
          {instructions[step] || "Loading..."}
        </div>
      </div>
      <div className="flex space-x-3">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black shadow hover:bg-gray-100 disabled:opacity-40"
        >
          ◀
        </button>
        <button
          onClick={toggleSpeech}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow hover:bg-gray-100"
        >
          {isSpeaking ? "⏸" : "▶"}
        </button>
        <button
          onClick={handleNext}
          disabled={!instructions.length || step === instructions.length - 1}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black shadow hover:bg-gray-100 disabled:opacity-40"
        >
          ▶
        </button>
      </div>
    </div>
  );
}