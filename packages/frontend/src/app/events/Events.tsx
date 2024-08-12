import { EventDto } from "@/hooks/events"

import { DiagonalLine, SingleEvent } from "./singleEvent"

export function Events({ events }: { events: EventDto[] }) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-2 px-4 md:px-0">
      <div className="flex w-full items-center justify-between">
        <h1 className="inline-flex items-baseline gap-2 text-4xl uppercase text-ra_red">
          <span className="h-6 w-6">
            <DiagonalLine />
          </span>{" "}
          Events
        </h1>
        {/* <div className="group flex items-center rounded-full border-2 border-ra_red px-4 py-2 font-mono text-xs hover:bg-ra_red">
          Submit event
          <div className="right-18 absolute top-2 font-mono text-xs opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100">
            coming soon!
          </div>
        </div> */}
      </div>

      {events
        .sort((a, b) => new Date(b.starts_at).valueOf() - new Date(a.starts_at).valueOf())
        .map((event) => (
          <SingleEvent key={event.id} event={event} />
        ))}
    </div>
  )
}
