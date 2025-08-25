'use client'

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import screenfull from "screenfull";

const Sidebar: React.FC<{
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}> = ({ isMuted, setIsMuted }) => {
  const { t, i18n } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (screenfull.isEnabled) {
        setIsFullscreen(screenfull.isFullscreen);
      }
    };

    if (screenfull.isEnabled) {
      screenfull.on('change', handleFullscreenChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleFullscreenChange);
      }
    };
  }, []);

  const toggleLangMenu = () => setShowLangMenu(prev => !prev);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLangMenu(false);
  };

  const toggleFullscreen = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState); 
    
    const videos = document.querySelectorAll<HTMLVideoElement>("video");
    const audios = document.querySelectorAll<HTMLAudioElement>("audio");
    videos.forEach(v => (v.muted = newMutedState));
    audios.forEach(a => (a.muted = newMutedState));
  };

  return (
    <div className="w-32 flex flex-col items-center py-6 bg-[#F8F5F2]">
      <div className="flex flex-col items-center space-y-5">
        <button title={t("menu")} className="p-3 rounded-full hover:bg-gray-200 transition-colors">
          <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="w-full flex flex-col items-center">
          <button
            onClick={toggleLangMenu}
            title={t("language")}
            className="p-3 rounded-full hover:bg-gray-200 transition-colors"
          >
            <span className="font-bold text-lg text-gray-700">文A</span>
          </button>

          {showLangMenu && (
            <div className="mt-2 w-full max-w-xs px-4">
              <div className="bg-white rounded-md shadow-lg p-1">
                <button
                  onClick={() => changeLanguage("en")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage("fr")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Français
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- ICON MUTE/UNMUTE MỚI --- */}
        <button onClick={toggleMute} title={t("mute")} className="p-3 rounded-full hover:bg-gray-200 transition-colors">
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707a1 1 0 011.414 0v17.414a1 1 0 01-1.414 0L5.586 15zM19 9l-6 6m0-6l6 6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707a1 1 0 011.414 0v17.414a1 1 0 01-1.414 0L5.586 15z" />
            </svg>
          )}
        </button>

        {/* --- ICON FULLSCREEN MỚI --- */}
        <button onClick={toggleFullscreen} title={t("fullscreen")} className="p-3 rounded-full hover:bg-gray-200 transition-colors">
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;