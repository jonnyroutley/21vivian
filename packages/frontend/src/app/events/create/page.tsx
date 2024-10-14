import { League_Gothic } from "next/font/google"

import { DiagonalLine } from "../singleEvent"

import { CreateEventForm } from "./CreateEventForm"

const leagueGothic = League_Gothic({ weight: "variable", subsets: ["latin"] })
export default async function CreateEventPage() {
  return (
    <main
      className={`flex min-h-screen w-full flex-col items-center bg-neutral-950 pt-8 font-sans text-neutral-50 ${leagueGothic.className}`}
    >
      <div className="flex w-full max-w-3xl flex-col gap-2 px-4 md:px-0">
        <div className="flex w-full flex-col items-start justify-between">
          <h1 className="inline-flex items-baseline gap-2 text-4xl uppercase text-ra_red">
            <span className="h-6 w-6">
              <DiagonalLine />
            </span>{" "}
            Create event
          </h1>
          <div className="">
            <CreateEventForm />
          </div>
        </div>
      </div>
    </main>
  )
}
