"use client"

import { useOptimistic } from "react"
import { z } from "zod"

import { createReviewAction } from "@/app/actions"
import { components } from "@/client/schema"
import { NewReview, Review } from "@/hooks/reviews"
import { cn, formatDateTime } from "@/lib/utils"

const inputReviewSchema = z.object({
  name: z.string(),
  stars: z.number().min(0).max(5),
  title: z.string(),
  description: z.string(),
})

function ReviewRow({
  name,
  description,
  title,
  stars,
  created_at,
  idx,
}: Omit<components["schemas"]["Review"], "id" | "is_archived"> & { idx: number }) {
  // const createdAt = new Date(
  return (
    <div
      key={idx + "row"}
      className={cn(
        "flex w-full -translate-x-1 flex-col gap-4 rounded-lg bg-white px-8 py-6 text-neutral-950 shadow-lg",
      )}
    >
      <h2 className="text-xl">{title}</h2>
      <div className="flex flex-row gap-2 text-lg">
        {[...Array(stars)].map((_, i) => {
          return <div key={i + "star" + idx}>🐈‍⬛</div>
        })}
      </div>
      <p>{description}</p>
      <div className="flex flex-row items-baseline justify-between">
        <p className="italic">{name}</p>
        <p className="text-sm text-neutral-500">{formatDateTime(created_at)}</p>
      </div>
    </div>
  )
}

export function CreateReview({ reviews }: { reviews: Review[] }) {
  const [optimisticReviews, addOptimisticReview] = useOptimistic<Review[], NewReview>(
    reviews,
    (state, newReview) => [
      ...state,
      {
        ...newReview,
        id: 4567890,
        created_at: "",
        is_archived: false,
      },
    ],
  )

  return (
    <>
      {optimisticReviews
        .filter((e) => !e.is_archived)
        .map((e, idx) => (
          <ReviewRow
            key={e.id}
            name={e.name}
            description={e.description}
            title={e.title}
            stars={e.stars}
            created_at={e.created_at}
            idx={idx}
          />
        ))}
      <div>
        <form
          action={async (formData: FormData) => {
            console.log("hey")
            const name = formData.get("name")
            const stars = formData.get("stars") as unknown
            const description = formData.get("description")
            const title = formData.get("title")

            const parsed = inputReviewSchema.safeParse({
              name,
              stars: parseInt(stars as string),
              description,
              title,
            })

            console.log(parsed)

            if (parsed.error) {
              return
            }

            addOptimisticReview(parsed.data)
            await createReviewAction(parsed.data)
          }}
        >
          <input type="text" name="name" />
          <input type="number" name="stars" />
          <input type="text" name="title" />
          <textarea name="description" />
          <button type="submit">Send</button>
        </form>
      </div>
    </>
  )
}
