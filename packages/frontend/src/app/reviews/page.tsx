import { DM_Mono } from "next/font/google"

import { CreateReview } from "@/components/CreateReview"
import { getReviews } from "@/hooks/reviews"
import { cn } from "@/lib/utils"

const dmMono = DM_Mono({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
})

export default async function Page() {
  const reviews = await getReviews()
  reviews.push({
    id: 5135,
    name: "The guy next door ",
    title: "Here is a long test title nice one",
    description:
      "Dinner was great, the service was excellent, and the ambiance was perfect. I would definitely recommend this place to my friends.",
    stars: 2,
    created_at: "2021-09-20T20:00:00",
    is_archived: false,
  })

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
          <CreateReview reviews={reviews} />
        </div>
      </div>
    </main>
  )
}
