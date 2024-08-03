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
      <div className="flex w-full max-w-3xl flex-col gap-2">
        <h1 className="text-ra_red inline-flex items-baseline gap-2 text-4xl uppercase">
          <span className="h-6 w-6">
            <DiagonalLine />
          </span>{" "}
          Events
        </h1>
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
