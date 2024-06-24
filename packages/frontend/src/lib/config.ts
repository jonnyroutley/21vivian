import { z } from "zod"

const configSchema = z.object({
  apiBaseUrl: z.string(),
})

export const config = configSchema.parse({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
})
