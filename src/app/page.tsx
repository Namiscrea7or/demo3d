"use client";

import dynamic from 'next/dynamic';

const Layout3D = dynamic(
  () => import('../components/layout3D/index'), 
  { 
    ssr: false,
    loading: () => <p className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">Loading 3D Scene...</p> 
  }
);

export default function Page() {
  return <Layout3D />;
}