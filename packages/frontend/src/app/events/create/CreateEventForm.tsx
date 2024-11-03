"use client"

import { useRef, useState } from "react"
import { set, z } from "zod"

import { createEvent } from "@/actions/events"
import { components } from "@/client/schema"
import { config } from "@/lib/config"

const createEventSchema = z.object({
  name: z.string().min(1, "Please enter a name"),
  location: z.string().min(1, "Please enter a location"),
  description: z.string().min(1, "Please enter a description"),
  starts_at: z.coerce
    .date({ message: "Start should be a valid date time" })
    .transform((date) => date.toISOString()),
  ends_at: z.coerce
    .date({ message: "End should be a valid date time" })
    .transform((date) => date.toISOString()),
  image_id: z.number(),
})

const uploadImage = async (file: File, setImageId: (image_id: number) => void) => {
  const getPresignedUrlResponse = await fetch(`${config.apiBaseUrl}/upload/presigned-link`)
  if (getPresignedUrlResponse.status !== 200) {
    // Do something
  }

  const json = (await getPresignedUrlResponse.json()) as components["schemas"]["PresignedLinkDto"]

  const presignedUrl = json.presigned_link

  try {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    console.log(response)
    setImageId(1)

    console.log("File uploaded successfully")
    return true
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export function CreateEventForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadFileId, setUploadFileId] = useState<number>()

  const [error, setError] = useState<string>()
  return (
    <form
      ref={formRef}
      action={async (formData: FormData) => {
        const name = formData.get("name")
        const location = formData.get("location")
        const description = formData.get("description")
        const starts_at = formData.get("starts_at")
        const ends_at = formData.get("ends_at")
        const image_id = formData.get("image_id")
        const result = createEventSchema.safeParse({
          name,
          location,
          description,
          starts_at,
          ends_at,
          image_id,
        })
        if (result.error) {
          console.log(result.error)
          console.log(starts_at)
          setError(result.error.errors[0]?.message)
          return
        }
        setError(undefined)
        console.log("attempting create")
        await createEvent(result.data)
      }}
      className="mt-8 flex w-full flex-col gap-6 text-3xl text-ra_red"
    >
      <label className="grid grid-cols-5 items-center justify-between gap-4">
        Name
        <input
          type="text"
          name="name"
          id="name"
          className="col-span-4 w-full rounded-md px-2 py-1 text-black"
        />
      </label>
      <label className="grid grid-cols-5 items-center justify-between gap-4">
        Location
        <input
          type="text"
          name="location"
          id="location"
          className="col-span-4 w-full rounded-md px-2 py-1 text-black"
        />
      </label>
      <label className="grid grid-cols-5 items-center justify-between gap-4">
        Description
        <textarea
          name="description"
          id="description"
          className="col-span-4 w-full rounded-md px-2 py-1 text-black"
        />
      </label>
      {/* hidden input for file id */}
      <input value={uploadFileId} className="hidden" name="image_id" />
      <label className="grid grid-cols-5 items-center justify-between gap-4">
        Image
        <input
          type="file"
          name="image"
          id="image"
          ref={fileInputRef}
          className="col-span-4 col-start-2 hidden w-full rounded-md px-2 py-1 text-black"
          accept=".jpg, .jpeg, .png" // TODO: consider if more needed here
        />
        <div className="col-span-4 w-full rounded-md border border-ra_red text-center hover:cursor-pointer hover:bg-ra_red hover:text-black">
          Select file 📎
        </div>
        <p className="col-span-4 col-start-2 text-center text-2xl">
          {fileInputRef.current?.value
            ? `Selected: ${fileInputRef.current?.value}`
            : "Please select an image"}
        </p>
      </label>
      <label className="grid grid-cols-5 items-center justify-between gap-4">
        Start
        <input
          type="datetime-local"
          name="starts_at"
          id="starts_at"
          className="col-span-4 rounded-md px-2 py-1 text-center text-black"
        />
      </label>
      <label className="grid grid-cols-5 items-center justify-between gap-4">
        End
        <input
          type="datetime-local"
          name="ends_at"
          id="ends_at"
          className="col-span-4 rounded-md px-2 py-1 text-center text-black"
        />
      </label>
      <div className="grid grid-cols-5">
        <button className="col-span-4 col-start-2 rounded-md border border-ra_red hover:bg-ra_red hover:text-black">
          Create
        </button>
        {error && <p className="col-span-4 col-start-2 mt-4 text-center text-2xl">{error}</p>}
      </div>
    </form>
  )
}
