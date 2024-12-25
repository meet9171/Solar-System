'use client'

import Image from "next/image";
import dynamic from 'next/dynamic'

const SolarSystem = dynamic(() => import('@/components/solar-system'), { 
  ssr: false,
  loading: () => <div className="w-screen h-screen bg-black" />
})

export default function Home() {
  return (

        <SolarSystem />

  );
}
