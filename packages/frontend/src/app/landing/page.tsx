"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function LandingPage() {
  const [pushing, setPushing] = useState(false)
  const thisYear = new Date().getFullYear()
  const maxAcceptableYear = thisYear - 18

  const router = useRouter()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // @ts-ignore
    const { birthYear } = event.target.elements

    console.log(birthYear)

    if (birthYear.value && birthYear.value < maxAcceptableYear) {
      setPushing(true)
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-neutral-950 text-rose-50">
      {pushing ? (
        <>
          <Image src="/mrSexy.png" alt="cat" width={300} height={300} className="animate-pulse" />
        </>
      ) : (
        <>
          <h1>We&apos;re delighted to see you.</h1>
          <p>We have to check if you are over 18. Please enter your birth year:</p>
          <form onSubmit={handleSubmit} className="flex flex-col">
            <input
              name="birthYear"
              className="m-4 rounded-md px-4 py-3 pb-6 text-center text-6xl text-neutral-900"
              type="number"
              maxLength={4}
              max={maxAcceptableYear}
              min={1900}
            />
            <button type="submit" className="hover:text-yellow-300">
              Confirm
            </button>
          </form>
        </>
      )}
    </main>
  )
}
