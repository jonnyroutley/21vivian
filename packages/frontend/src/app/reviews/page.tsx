import { DM_Mono } from "next/font/google"

import { components } from "@/client/schema"
import { CreateReview } from "@/components/CreateReview"
import { getReviews } from "@/hooks/reviews"
import { cn, formatDateTime } from "@/lib/utils"

const dmMono = DM_Mono({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
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
      className={cn(
        "flex w-full -translate-x-1 flex-col gap-4 rounded-lg bg-white px-8 py-6 text-neutral-950 shadow-lg",
      )}
    >
      <h2 className="text-xl">{title}</h2>
      <div className="flex flex-row gap-2 text-lg">
        {[...Array(stars)].map((i) => {
          return <div key={i}>🐈‍⬛</div>
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

export default async function Page() {
  const reviews = await getReviews()
  reviews.push({
    id: 1,
    name: "The guy next door ",
    title: "Here is a long test title nice one",
    description:
      "Dinner was great, the service was excellent, and the ambiance was perfect. I would definitely recommend this place to my friends.",
    stars: 2,
    created_at: "2021-09-20T20:00:00",
    is_archived: false,
  })
  console.log(reviews)

  return (
    <main
      className={cn(
        "flex min-h-screen w-full flex-col items-center bg-neutral-200 bg-[url('/leopard.jpg')] p-4 md:p-16",
        dmMono.className,
      )}
    >
      <div className="flex w-full max-w-lg flex-col gap-8">
        <h1 className="text-6xl lg:text-8xl">Reviews</h1>
        {/* <CreateReview reviews={reviews} /> */}
        <div className="flex flex-col gap-2 md:gap-6">
          {reviews
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
        </div>
      </div>
    </main>
  )
}
