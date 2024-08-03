import moment from "moment"

import { components } from "@/client/schema"

function LocationPinIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      aria-label="Location"
      className="text-ra_red h-6 w-6"
    >
      <title>Location</title>
      <g fill="none" fill-rule="evenodd">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path
          d="M13.613 15.075c.26-.501.505-.988.732-1.456C15.393 11.456 16 9.785 16 9a4 4 0 10-8 0c0 .785.607 2.456 1.655 4.619.227.468.472.955.732 1.456A83.615 83.615 0 0012 18.022c.55-.962 1.1-1.96 1.613-2.947zM18 9c0 1.2-.67 3.045-1.855 5.491-.236.486-.49.99-.758 1.506a86.17 86.17 0 01-2.532 4.522 1 1 0 01-1.71 0 85.564 85.564 0 01-.793-1.35 86.17 86.17 0 01-1.74-3.172 60.318 60.318 0 01-.757-1.506C6.67 12.045 6 10.201 6 9a6 6 0 016-6 6 6 0 016 6z"
          fill="currentColor"
        ></path>
        <path d="M13 9a1 1 0 11-2 0 1 1 0 112 0" fill="currentColor"></path>
      </g>
    </svg>
  )
}

function AttendeesIcon() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      aria-label="Person"
      className="text-ra_red h-6 w-6"
    >
      <title>Person</title>
      <g fill="none" fill-rule="evenodd">
        <path fill="none" d="M0 0h24v24H0z"></path>
        <path
          d="M14 8a2 2 0 10-4 0 2 2 0 004 0zm2 0a4 4 0 11-8 0 4 4 0 018 0zM7 19a1 1 0 01-2 0 7 7 0 0114 0 1 1 0 01-2 0 5 5 0 00-10 0z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  )
}

export function DiagonalLine() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="100" y1="0" x2="0" y2="100" vector-effect="non-scaling-stroke" stroke="red" />
    </svg>
  )
}

export function SingleEvent({ event }: { event: components["schemas"]["EventDTO"] }) {
  return (
    <>
      <h2 className="text-ra_red inline-flex items-baseline gap-2 text-2xl uppercase">
        <span className="h-4 w-4">
          <DiagonalLine />
        </span>{" "}
        {moment(event.starts_at).format("ddd, DD MMM")}
      </h2>
      <div className="flex flex-row gap-4 border-t border-neutral-700 pt-3 text-neutral-50">
        {/* this will be replaced by image */}
        <div className="aspect-video w-2/3 bg-neutral-600"></div>
        <div className="flex w-full flex-col gap-2">
          <h3 className="text-2xl tracking-wide">{event.name}</h3>
          <h4 className="font-sans">{event.description}</h4>
          <div className="flex w-full flex-row justify-between p-1 font-mono text-xs">
            <p className="flex items-center gap-2">
              <LocationPinIcon /> {event.location}
            </p>
            <p className="peer flex items-center gap-2 p-1 hover:bg-neutral-800">
              <AttendeesIcon /> {event.attendees.length}
            </p>
            <ul className="peer invisible absolute right-80 peer-hover:visible">
              {event.attendees.map((attendee) => (
                <li key={attendee.id}>{attendee.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
