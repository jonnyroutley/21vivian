'use client'
 
import { NewReview, Review } from '@/hooks/reviews'
import { useOptimistic } from 'react'
import { z } from "zod";

const inputReviewSchema = z.object({
  name: z.string(),
  stars: z.number().min(0).max(5),
  title: z.string(),
  description: z.string()
})
  
export function CreateReview({ reviews }: { reviews: Review[] }) {
  const [optimisticReviews, addOptimisticReview] = useOptimistic<
    Review[],
    NewReview
  >(reviews, (state, newReview) => [...state, { 
    ...newReview,
    id: 1,
    created_at: "",
    is_archived: false,
   }])
 
  return (
    <div>
      {optimisticReviews.map((review, k) => (
        <div key={k}>{review.name}</div>
      ))}
      <form
        action={async (formData: FormData) => {
          const name = formData.get('name')
          const stars = formData.get('stars')
          const description = formData.get('description')
          const title = formData.get('title')
          
          const inputReview = inputReviewSchema.safeParse({
            name,
            stars,
            description,
            title
          })
          
          addOptimisticReview(inputReview)
          createReviewAction(inputReview)
          // await send(review)
        }}
      >
        <input type="text" name="name" />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}