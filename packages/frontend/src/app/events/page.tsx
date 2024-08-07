import { League_Gothic } from "next/font/google"
import { useRouter } from "next/navigation"

import { components } from "@/client/schema"
import { config } from "@/lib/config"

import { Events } from "./Events"
import { DiagonalLine, SingleEvent } from "./SingleEvent"

async function getEvents(): Promise<components["schemas"]["EventDto"][]> {
  const res = await fetch(`${config.apiBaseUrl}/events`, {
    method: "GET",
    cache: "no-store",
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
      <Events events={events} />
    </main>
  )
}
