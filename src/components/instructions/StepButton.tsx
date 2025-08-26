"use client";

import clsx from "clsx";

type StepButtonProps = {
  label: string;
  index: number;
  active: boolean;
  onClick: () => void;
};

export default function StepButton({ label, index, active, onClick }: StepButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "p-4 rounded-lg text-center w-40",
        active
          ? "bg-teal-600 text-white"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      )}
    >
      <div className="text-xs font-semibold">STEP {index + 1}</div>
      <div className="text-sm">{label}</div>
    </button>
  );
}
