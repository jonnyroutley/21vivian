import { z } from "zod"

const configSchema = z.object({
  apiBaseUrl: z.string(),
  octopusApiKey: z.string(),
})

export const config = configSchema.parse({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  octopusApiKey: process.env.NEXT_PUBLIC_OCTOPUS_API_KEY,
})
