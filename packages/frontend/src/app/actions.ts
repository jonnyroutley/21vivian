'use server'

import {createReview} from "@hooks/reviews"
 
export async function createReviewAction(newReview: NewReview) {
  await createReview(newReview)

  return {
    message: 'Please enter a valid email',
  }
}