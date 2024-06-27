import { components, paths } from "../client/schema"

export type Reviews =
  paths["/reviews"]["get"]["responses"]["201"]["content"]["application/json; charset=utf-8"]
export type Review = components["schemas"]["Review"]
export type NewReview = components["schemas"]["InputModel"]

export async function getReviews() {
  const query = await fetch("http://localhost:8000/reviews")

  const json = await query.json()
  const okay = json as Reviews
  return okay
}

type CreateReview =
  paths["/reviews"]["post"]["requestBody"]["content"]["application/json; charset=utf-8"]

export async function createReview(data: CreateReview) {
  return fetch("http://localhost:8000/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
