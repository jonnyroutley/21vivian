'use client'

import { Initial } from '@/components/initial'
import Image from 'next/image'
import { TypeAnimation } from 'react-type-animation'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-rose-50 bg-emerald-900 w-full">
      <div className="flex flex-col gap-8 items-center">
        <h1 className=" text-5xl md:text-9xl">
          <Initial initial="R" />
          <TypeAnimation
            sequence={['OBUST', 500, 'ADIANT', 500, 'ESPECTFUL']}
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
        <h2 className="animate-pulse text-xs md:text-base">Coming soon...</h2>
      </div>
    </main>
  )
}
