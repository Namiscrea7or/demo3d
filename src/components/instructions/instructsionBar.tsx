"use client";

type Props = {
  steps: string[];
};

export default function InstructionPanel({ steps }: Props) {
  return (
    <div className="h-32 bg-gray-800 border-t border-gray-700 p-4 flex gap-4 overflow-x-auto">
      {steps.map((step, index) => (
        <div
          key={index}
          className="min-w-[150px] p-3 bg-gray-700 rounded-lg flex flex-col justify-center items-center"
        >
          <span className="text-sm font-medium">STEP {index + 1}</span>
          <p className="text-xs mt-1 text-gray-300">{step}</p>
        </div>
      ))}
    </div>
  );
}
