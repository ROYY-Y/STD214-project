"use client";

import dynamic from "next/dynamic";


const Simulator = dynamic(() => import("@/components/Simulator"), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ backgroundColor: "#0b0f19", minHeight: "100vh" }}>
      <Simulator />
    </main>
  );
}


