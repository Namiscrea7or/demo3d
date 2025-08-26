"use client";

import { PlayIcon } from "@heroicons/react/24/solid";

type PlayButtonProps = {
  onClick: () => void;
};

export default function PlayButton({ onClick }: PlayButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white"
    >
      <PlayIcon className="h-5 w-5 mr-2" />
      Play
    </button>
  );
}
