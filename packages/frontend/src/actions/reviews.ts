"use server"

import { revalidatePath } from "next/cache"

import { config } from "@/lib/config"

import { components, paths } from "../client/schema"

export type Review = components["schemas"]["Review"]
export type NewReview = components["schemas"]["InputModel"]

type CreateReview =
  paths["/reviews"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"]

export async function getReviews() {
  const response = await fetch(`${config.apiBaseUrl}/reviews`, { cache: "no-store" })

  const json = (await response.json()) as components["schemas"]["Review"][]
  return json
}

export async function createReview(reviewData: CreateReview) {
  await fetch(`${config.apiBaseUrl}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  })

  revalidatePath("/reviews")
  return { message: "success" }
}
