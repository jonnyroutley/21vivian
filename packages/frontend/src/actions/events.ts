"use server"

import { revalidatePath } from "next/cache"

import { config } from "@/lib/config"

import { components, paths } from "../client/schema"

export type EventDto = components["schemas"]["EventDto"]

export type CreateEvent =
  paths["/events"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"]

export async function createEvent(eventData: CreateEvent) {
  await fetch(`${config.apiBaseUrl}/events/attendee`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  })

  revalidatePath("/events")
  return {
    message: "success",
  }
}
