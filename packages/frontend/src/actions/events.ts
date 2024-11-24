"use server"

import { revalidatePath } from "next/cache"

import { config } from "@/lib/config"

import { components, paths } from "../client/schema"

export type EventDto = components["schemas"]["EventDto"]

export type CreateEventBody =
  paths["/events"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"]

export type AddAttendeeBody =
  paths["/events/attendee"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"]

export async function addAttendeeToEvent(eventData: AddAttendeeBody) {
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

export async function createEvent(eventData: CreateEventBody) {
  await fetch(`${config.apiBaseUrl}/events`, {
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
