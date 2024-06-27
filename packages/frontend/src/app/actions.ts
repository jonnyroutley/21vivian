'use server'

import { createReview, NewReview } from "@/hooks/reviews"
import { revalidatePath } from "next/cache"

export async function createReviewAction(newReview: NewReview) {
  const data = await createReview(newReview)

  revalidatePath("/reviews")

  return {
    message: "success"
  }
}