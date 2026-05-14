'use client'
import { Suspense } from 'react';
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";

function ClientLayoutContent() {
  return (
    <>
      <Banner />
      <Navbar />
    </>
  );
}

export default function ClientLayout() {
  return (
    <Suspense fallback={null}>
      <ClientLayoutContent />
    </Suspense>
  );
}
