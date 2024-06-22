"use client"

import { TypeAnimation } from "react-type-animation"

import { GordonsAd } from "@/components/advertisements"
import { Initial } from "@/components/initial"

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-emerald-950 text-rose-50">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-5xl lg:text-9xl">
          <Initial initial="R" />
          <TypeAnimation
            sequence={["OBUST", 500, "ADIANT", 500, "ESPECTFUL"]}
            wrapper="span"
            cursor={true}
            speed={1}
          />
          {/* ESPECTFUL */}
          <br />
          <span className="tracking-widest">
            <Initial initial="G" />
            ENTLEMEN
          </span>
        </h1>
        <h2 className="animate-pulse text-xs lg:text-base">Coming soon...</h2>
        <GordonsAd />
      </div>
    </main>
  )
}
