import Image from "next/image"

import { components } from "@/client/schema"
import { config } from "@/lib/config"

const getPresignedLink = async (upload_key: string): Promise<string> => {
  const res = await fetch(`${config.apiBaseUrl}/upload/presigned-link/${upload_key}`)
  const body = await res.json()
  if ("presigned_link" in body && typeof body.presigned_link === "string") {
    return body.presigned_link
  }
  throw new Error("Unable to get presigned link")
}

export async function EventImage({ event }: { event: components["schemas"]["EventDto"] }) {
  if (event.upload_key) {
    const presignedLink = await getPresignedLink(event.upload_key)
    return (
      <>
        <Image
          src={presignedLink}
          height={300}
          width={400}
          alt="fraser bbq"
          className="w-full md:w-1/3"
        />
      </>
    )
  }
  return (
    <Image
      src={"/allPointsEast.webp"}
      height={300}
      width={400}
      alt="all points east"
      className="w-full md:w-1/3"
    />
  )
}
