"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const Layout3D = dynamic(
  () => import("../../../components/layout3D/index"),
  {
    ssr: false,
    loading: () => (
      <p className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        Loading 3D Scene...
      </p>
    ),
  }
);

export default function EditPage() {
  const params = useParams(); 
  const { id } = params;

  return (
    <div className="h-screen w-screen bg-gray-900 text-white">
      <h1 className="p-4">Editing Project ID: {id}</h1>
      <Layout3D />
    </div>
  );
}
