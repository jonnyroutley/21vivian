"use client"

import { useOptimistic, useRef, useState } from "react"
import { z } from "zod"

import { NewReview, Review, createReview } from "@/actions/reviews"
import { components } from "@/client/schema"
import { cn, formatDateTime } from "@/lib/utils"

const inputReviewSchema = z.object({
  name: z.string().min(1, "Please enter a name"),
  stars: z.number({ message: "Please select a rating" }).min(0).max(5),
  title: z.string().min(1, "Please enter a title"),
  description: z.string().min(1, "Please enter a description"),
})

function ReviewRow({
  name,
  description,
  title,
  stars,
  created_at,
  idx,
}: Omit<components["schemas"]["Review"], "id" | "is_archived"> & { idx: number }) {
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
  const ref = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string>()
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
      <div>
        <form
          ref={ref}
          className="flex flex-col gap-4"
          action={async (formData: FormData) => {
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

            if (parsed.error) {
              setError(parsed.error.errors[0]?.message)
              return
            }
            setError(undefined)
            addOptimisticReview(parsed.data)
            await createReview(parsed.data)
            ref.current?.reset()
          }}
        >
          <div className="flex flex-col gap-4 rounded-md bg-neutral-800 px-4 py-3 shadow-md">
            <label htmlFor="name" className="text-xl text-white">
              Your name
            </label>
            <input type="text" name="name" id="name" className="rounded-md p-2" />

            <fieldset>
              <div className="flex flex-col gap-4">
                <legend className="text-xl text-white">Rating /5</legend>
                <div className="flex flex-row-reverse justify-end">
                  {Array.from(Array(5)).map((_, idx) => (
                    <>
                      <input
                        key={idx}
                        type="radio"
                        name="stars"
                        value={5 - idx}
                        id={`stars-${idx}`}
                        className="peer hidden"
                      />
                      <label
                        htmlFor={`stars-${idx}`}
                        className="px-1 opacity-50 hover:cursor-pointer hover:text-lg peer-checked:opacity-100 peer-hover:opacity-100"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                          🐈‍⬛
                        </div>
                      </label>
                    </>
                  ))}
                </div>
              </div>
            </fieldset>

            <label htmlFor="title" className="text-xl text-white">
              Title
            </label>
            <input type="text" name="title" id="title" className="rounded-md p-2" />

            <label htmlFor="description" className="text-xl text-white">
              Description
            </label>
            <textarea name="description" id="description" className="rounded-md p-2" />
            {error && <p className="text-red-100">{error}</p>}
            <button
              type="submit"
              className="mx-auto my-4 rounded-md bg-gradient-to-tr from-neutral-50 to-neutral-400 px-6 py-4 text-xl transition-all hover:ring-2 hover:ring-white hover:ring-offset-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      {optimisticReviews
        .filter((e) => !e.is_archived)
        .toReversed() // should change this on backend soon
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
    </>
  )
}
