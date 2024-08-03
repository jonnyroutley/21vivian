import { League_Gothic } from "next/font/google"
import { useRouter } from "next/navigation"

import { components } from "@/client/schema"
import { config } from "@/lib/config"

import { DiagonalLine, SingleEvent } from "./singleEvent"

async function getEvents(): Promise<components["schemas"]["EventDTO"][]> {
  const res = await fetch(`${config.apiBaseUrl}/events`, {
    method: "GET",
  })

  return res.json()
}

const leagueGothic = League_Gothic({ weight: "variable", subsets: ["latin"] })

export default async function LandingPage() {
  const events = await getEvents()

  return (
    <main
      className={`flex min-h-screen w-full flex-col items-center bg-neutral-950 pt-8 font-sans text-neutral-50 ${leagueGothic.className}`}
    >
      <div className="flex px-4 md:px-0 w-full max-w-3xl flex-col gap-2">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-ra_red inline-flex items-baseline gap-2 text-4xl uppercase">
            <span className="h-6 w-6">
              <DiagonalLine />
            </span>{" "}
            Events
          </h1>
          <div className="hover:bg-ra_red border-ra_red group flex items-center rounded-full border-2 px-4 py-2 font-mono text-xs">
            Submit event
            <div className="right-18 peer absolute top-2 font-mono text-xs opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
              coming soon!
            </div>
          </div>
        </div>
        {events.map((event) => (
          <SingleEvent key={event.id} event={event} />
        ))}
        {events.map((event) => (
          <SingleEvent key={event.id} event={event} />
        ))}
        {events.map((event) => (
          <SingleEvent key={event.id} event={event} />
        ))}
      </div>
    </main>
  )
}
