import { config } from "@/lib/config"

import { components, paths } from "../client/schema"

export type Review = components["schemas"]["Review"]
export type NewReview = components["schemas"]["InputModel"]

type CreateReview =
  paths["/reviews"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"]

export async function createReview(data: CreateReview) {
  console.log("posting", data)
  const data2 = await fetch(`${config.apiBaseUrl}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  console.debug(data2)

  return data2
}
