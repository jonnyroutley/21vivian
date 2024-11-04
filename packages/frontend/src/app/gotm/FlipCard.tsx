"use client"

import { url } from "inspector"
import Image from "next/image"
import React, { useState } from "react"

const styles = `
  /* Custom styles for 3D transforms */
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-preserve-3d {
    transform-style: preserve-3d;
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
`

const girlfriends = {
  girlfriend1: {
    name: "July 24",
    boyfriend: "Fraser",
    girlfriend: "Gigi",
    url: "/girlfriends/gigi.webp",
  },
  girlfriend2: {
    name: "August 24",
    boyfriend: "Jonny",
    girlfriend: "Anna",
    url: "/girlfriends/anna.jpg",
  },
  girlfriend3: {
    name: "September 24",
    boyfriend: "Luke",
    girlfriend: "Jess",
    url: "/girlfriends/jess.jpg",
  },
  girlfriend4: {
    name: "October 24",
    girlfriend: "Lucy",
    boyfriend: "George",
    url: "/girlfriends/lucy.jpg",
  },
} as const

export const FlipCard = ({ girlfriendKey }: { girlfriendKey: keyof typeof girlfriends }) => {
  const [isFlipped, setIsFlipped] = useState(false)
  console.log(girlfriends, girlfriendKey)
  const { name, boyfriend, girlfriend, url } = girlfriends[girlfriendKey]

  return (
    <>
      <style>{styles}</style>
      <div className="perspective-1000 h-96 w-64">
        <div
          className={`transform-style-preserve-3d relative h-full w-full cursor-pointer transition-transform duration-500 ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of card */}
          <div className="backface-hidden absolute flex h-full w-full flex-col items-center justify-center rounded-sm border-4 border-amber-900 bg-neutral-800 p-6 shadow-lg">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-neutral-900">
              <span className="absolute z-0 text-8xl font-bold text-neutral-800">?</span>
              <h2 className="relative z-10 mb-4 text-2xl font-bold text-amber-300">{name}</h2>
            </div>
          </div>

          {/* Back of card */}
          <div className="backface-hidden rotate-y-180 absolute flex h-full w-full flex-col items-center justify-center gap-4 rounded-sm border-4 border-amber-900 bg-neutral-800 p-6 shadow-lg">
            {/* <div className="flex h-32 w-32 items-center rounded-full"> */}
            <h2 className="text-center text-2xl font-bold text-amber-300">✨{girlfriend}✨</h2>
            <Image
              alt="gf"
              src={url}
              width={300}
              height={300}
              className="h-48 w-48 rounded-full object-cover z-10"
            />
            {/* </div> */}
            <h2 className="mb-4 text-center text-xl text-amber-300">Girlfriend of: {boyfriend}</h2>
          </div>
        </div>
      </div>
    </>
  )
}
