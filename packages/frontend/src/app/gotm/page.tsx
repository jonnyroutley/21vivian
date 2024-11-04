import { Blob1, Blob2, Blob3 } from "@/components/blobs"

import { FlipCard } from "./FlipCard"

export default function GirlfriendOfTheMonth() {
  return (
    <div className="relative h-screen w-full overflow-x-hidden bg-[#626791]">
      <Blob1 fill="#B15E81" className="absolute left-[5%] top-[30%] h-64" />
      <Blob2 fill="#59838D" className="absolute left-[10%] top-[50%] h-96" />
      <Blob3 fill="#D18D6A" className="absolute left-[15%] top-[20%] h-32" />
      <Blob1 fill="#B15E81" className="absolute left-[40%] top-[60%] h-96" />
      <Blob2 fill="#59838D" className="absolute left-[35%] top-[10%] h-80" />
      <Blob3 fill="#D18D6A" className="absolute left-[60%] top-[30%] h-48" />
      <Blob1 fill="#B15E81" className="absolute left-[70%] top-[10%] h-64" />
      <Blob2 fill="#59838D" className="absolute left-[80%] top-[40%] h-24" />
      <Blob3 fill="#D18D6A" className="absolute left-[80%] top-[50%] h-32" />
      <div className="mt-8 flex w-full flex-col justify-center gap-12 lg:mt-0">
        <div className="mx-auto flex min-h-screen w-fit flex-col items-center justify-center gap-12 px-8">
          <h1 className="z-10 text-7xl text-amber-300">Girlfriend of the month</h1>
          <div className="flex flex-shrink-0 flex-col items-center gap-12 lg:flex-row">
            {/* <div className="z-10 h-96 w-64 bg-amber-800"></div> */}

            <FlipCard girlfriendKey="girlfriend4" />
            <FlipCard girlfriendKey="girlfriend3" />
            <FlipCard girlfriendKey="girlfriend2" />
            <FlipCard girlfriendKey="girlfriend1" />
          </div>
        </div>
      </div>
    </div>
  )
}
