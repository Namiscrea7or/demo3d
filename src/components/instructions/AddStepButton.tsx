"use client";

import { PlusIcon } from "@heroicons/react/24/solid";

type AddStepButtonProps = {
  onClick: () => void;
};

export default function AddStepButton({ onClick }: AddStepButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center px-2 py-1 bg-gray-600 hover:bg-gray-500 text-xs rounded text-white"
    >
      <PlusIcon className="h-4 w-4 mr-1" />
      Add Scene
    </button>
  );
}
