import { config } from "@/lib/config"

import { components, paths } from "../client/schema"

export type EventDto = components["schemas"]["EventDto"]
export type NewAttendee = components["schemas"]["AttendeeInputModel"]

export type CreateEvent =
  paths["/events/attendee"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"]

export async function createEvent(data: CreateEvent) {
  console.log(data)

  const data2 = await fetch(`${config.apiBaseUrl}/events/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  console.log(JSON.stringify(data))

  console.log(data2)

  return data2
}
