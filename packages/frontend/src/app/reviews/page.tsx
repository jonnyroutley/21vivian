import { getReviews } from "@/hooks/reviews"

export default async function Page() {
  const data = await getReviews()

  console.log(data)

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-emerald-950 text-rose-50 p-16">
      <div className="w-full max-w-md flex gap-8">
        <div className="">
          <h1 className="text-6xl">Reviews</h1>
          {data.map((e) => (
            <div key={e.id}>
              <h2>{e.name}</h2>
              <h3>{e.description}</h3>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
