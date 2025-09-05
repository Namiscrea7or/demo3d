// app/edit/[id]/page.tsx
// server component - đơn giản + chắc chắn
import React from "react";

type Props = {
  params: { id: string };
};

export default function EditPage({ params }: Props) {
  const { id } = params;
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-medium">Editing Project ID: {id}</h1>
      {/* import Layout3D nếu cần */}
    </div>
  );
}
