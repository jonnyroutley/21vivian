"use server"

import { revalidatePath } from "next/cache"

import { paths } from "@/client/schema"
import { NewReview, createReview } from "@/hooks/reviews"
import { config } from "@/lib/config"

export type Reviews =
  paths["/reviews"]["get"]["responses"]["201"]["content"]["application/json; charset=utf-8"]

export async function createReviewAction(newReview: NewReview) {
  const data = await createReview(newReview)

  revalidatePath("/reviews")

  return {
    message: "success",
  }
}

export async function getReviews() {
  const query = await fetch(`${config.apiBaseUrl}/reviews`, { cache: "no-store" })

  const json = await query.json()
  const okay = json as Reviews
  return okay
}
